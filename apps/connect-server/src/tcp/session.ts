import { Socket } from 'net';
import { logger } from '@repo/logger';
import { HeaderStruct } from '@repo/protocol';
import { TokenBucket, IpBlacklist } from '../security/tokenBucket';
import { LoginGuard } from '../security/loginGuard';
import { RpcClient } from '../network/rpcClient';
import { WydCipher } from '../security/cipher';

const PACKET_LOGIN = 0x20d;

export const CONNECTION_STATE = {
  connection: 'connection',
  login: 'login',
  password: 'password',
  characters: 'characters',
  game: 'game',
};

export class ClientSession {
  private traceId: string;

  private buffer: Buffer;
  private tokenBucket: TokenBucket;
  private state = CONNECTION_STATE.connection;

  constructor(
    private sessionId: string,
    private socket: Socket,
    private rpcClient: RpcClient,
  ) {
    this.traceId = sessionId;
    this.buffer = Buffer.alloc(0);
    this.tokenBucket = new TokenBucket(50, 10);

    this.setupSocket();
  }

  private setupSocket() {
    this.socket.on('data', (data) => this.onData(data));
    this.socket.on('error', (err) => this.onError(err));
    this.socket.on('close', () => this.onClose());
  }

  private onData(buffer: Buffer) {
    if (this.state === CONNECTION_STATE.connection) {
      if (buffer.length === 4 || buffer.length === 120) {
        this.state = CONNECTION_STATE.login;

        if (buffer.length === 120) {
          this.onData(buffer.subarray(4));
        }
      } else {
        this.socket.destroy();
      }
    } else {
      const decryptBuffer = WydCipher.decrypt(buffer);

      if (!decryptBuffer) {
        this.socket.destroy();
        return;
      }

      const packageSize = decryptBuffer.readUInt16LE(0);
      if (packageSize !== decryptBuffer.length) {
        this.socket.destroy();
        return;
      }

      this.onPacket(decryptBuffer);
    }
  }

  private async onPacket(packet: Buffer) {
    if (!this.tokenBucket.consume(1)) {
      logger.warn(
        { sessionId: this.sessionId, ip: this.socket.remoteAddress },
        'Rate Limit Exceeded',
      );
      IpBlacklist.getInstance().add(this.socket.remoteAddress || '', 300); // 5 mins
      this.socket.destroy();
      return;
    }

    const header = new HeaderStruct(packet);

    logger.info(
      {
        sessionId: this.sessionId,
        size: packet.length,
        packetId: `0x${header.packetId.toString(16).toUpperCase()}`,
      },
      'Packet Received',
    );

    // if (header.packetId === PACKET_LOGIN && this.socket.remoteAddress) {
    //   const canLogin = await LoginGuard.checkIp(this.socket.remoteAddress);
    //   if (!canLogin) {
    //     logger.warn({ sessionId: this.sessionId, ip: this.socket.remoteAddress }, 'Blocked by Login Guard');
    //     // TODO: Send specific error packet before closing?
    //     this.socket.destroy();
    //     return;
    //   }
    // }

    this.rpcClient.sendPacket(this.sessionId, packet);
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
