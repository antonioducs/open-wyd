import { Socket } from 'net';
import { logger } from '@repo/logger';
import { WydCipher } from '@repo/protocol';
import { TokenBucket, IpBlacklist } from '../security/tokenBucket';
import { LoginGuard } from '../security/loginGuard';

const PACKET_LOGIN = 0x20D;

export class ClientSession {
  public sessionId: string;
  public socket: Socket;
  public traceId: string; // Used for distributed tracing

  private buffer: Buffer;
  private tokenBucket: TokenBucket;

  constructor(sessionId: string, socket: Socket) {
    this.sessionId = sessionId;
    this.socket = socket;
    this.traceId = sessionId; // Using sessionId as traceId for now
    this.buffer = Buffer.alloc(0);
    this.tokenBucket = new TokenBucket(50, 10); // Capacity 50, 10 tokens/sec

    this.setupSocket();
  }

  private setupSocket() {
    this.socket.on('data', (data) => this.onData(data));
    this.socket.on('error', (err) => this.onError(err));
    this.socket.on('close', () => this.onClose());
  }

  private onData(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (true) {
      if (this.buffer.length < 2) {
        break; // Not enough data for header
      }

      const size = this.buffer.readUInt16LE(0);

      // Check if we have the full packet (Header + Payload)
      // Note: Depending on protocol, size might include header or not.
      // Assuming standard WYD packet where size includes the header itself (2 bytes).
      // If size < 2, it's invalid or empty.
      if (this.buffer.length < size) {
        break; // Wait for more data
      }

      const packet = this.buffer.subarray(0, size);
      this.buffer = this.buffer.subarray(size);

      this.onPacket(packet);
    }
  }

  private async onPacket(packet: Buffer) {
    // 1. Rate Limiting Check
    if (!this.tokenBucket.consume(1)) {
      logger.warn({ sessionId: this.sessionId, ip: this.socket.remoteAddress }, 'Rate Limit Exceeded');
      IpBlacklist.getInstance().add(this.socket.remoteAddress || '', 300); // 5 mins
      this.socket.destroy();
      return;
    }

    logger.debug({ sessionId: this.sessionId, size: packet.length }, 'Packet Received');
    const cleanBuffer = WydCipher.decrypt(packet);

    if (!cleanBuffer) {
      logger.warn(
        { sessionId: this.sessionId },
        'Invalid packet checksum. Possible attack or corrupted packet.',
      );
      this.socket.destroy();
      return;
    }

    // 2. Login Guard Check
    if (cleanBuffer.length >= 4) {
      const packetId = cleanBuffer.readUInt16LE(2);
      if (packetId === PACKET_LOGIN && this.socket.remoteAddress) {
        const canLogin = await LoginGuard.checkIp(this.socket.remoteAddress);
        if (!canLogin) {
          logger.warn({ sessionId: this.sessionId, ip: this.socket.remoteAddress }, 'Blocked by Login Guard');
          // TODO: Send specific error packet before closing?
          this.socket.destroy();
          return;
        }
      }
    }

    // TODO: Forward to gRPC handler
  }

  private onError(err: Error) {
    logger.error({ sessionId: this.sessionId, err }, 'Socket Error');
  }

  private onClose() {
    logger.info({ sessionId: this.sessionId }, 'Client Disconnected');
  }

  public send(buffer: Buffer) {
    this.socket.write(buffer);
  }
}
