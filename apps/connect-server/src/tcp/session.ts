import { Socket } from 'net';
import { logger } from '@repo/logger';

export class ClientSession {
    public sessionId: string;
    public socket: Socket;
    public traceId: string; // Used for distributed tracing

    private buffer: Buffer;

    constructor(sessionId: string, socket: Socket) {
        this.sessionId = sessionId;
        this.socket = socket;
        this.traceId = sessionId; // Using sessionId as traceId for now
        this.buffer = Buffer.alloc(0);

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

    private onPacket(packet: Buffer) {
        logger.debug({ sessionId: this.sessionId, size: packet.length }, "Packet Received");
        // TODO: Forward to gRPC handler
    }

    private onError(err: Error) {
        logger.error({ sessionId: this.sessionId, err }, "Socket Error");
    }

    private onClose() {
        logger.info({ sessionId: this.sessionId }, "Client Disconnected");
    }

    public send(buffer: Buffer) {
        this.socket.write(buffer);
    }
}
