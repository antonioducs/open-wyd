import * as grpc from '@grpc/grpc-js';
import { GameLinkService, PacketFrame, EventType } from '@repo/protocol';
import { logger } from '@repo/logger';
import { handleLogin } from '../../domain/useCases/auth/login-use-case';

export class RpcServer {
  private server: grpc.Server;

  constructor(private port: number = 50051) {
    this.server = new grpc.Server();
  }

  public start() {
    // Add the generic service implementation
    this.server.addService(GameLinkService, {
      stream: this.handleStream.bind(this),
    });

    const bindAddr = `0.0.0.0:${this.port}`;
    this.server.bindAsync(bindAddr, grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err) {
        logger.error({ error: err }, `Failed to bind gRPC server on ${bindAddr}`);
        return;
      }
      logger.info(`RPC Server listening on ${bindAddr}`);
      this.server.start();
    });
  }

  private handleStream(call: grpc.ServerDuplexStream<PacketFrame, PacketFrame>) {
    logger.info('New Gateway Connection established via gRPC.');

    call.on('data', (frame: PacketFrame) => {
      this.processFrame(call, frame);
    });

    call.on('end', () => {
      logger.info('Gateway Connection ended.');
    });

    call.on('error', (err) => {
      logger.error({ error: err }, 'gRPC Stream Error');
    });
  }

  private processFrame(
    call: grpc.ServerDuplexStream<PacketFrame, PacketFrame>,
    frame: PacketFrame,
  ) {
    // Basic Packet Routing
    if (frame.type === EventType.DATA && frame.payload) {
      const buffer = frame.payload;
      if (buffer.length < 4) return; // Header size check

      // Packet HeaderReader manual check (or use BinaryReader)
      // Header: Size(2), Key(2), Checksum(2), PacketId(2) -> Offset 6
      const packetId = buffer.readUInt16LE(6);

      logger.info(`[Packet] Received OpCode: 0x${packetId.toString(16).toUpperCase()} Size: ${buffer.length}`);

      if (packetId === 0x20D) {
        // Handle Login
        handleLogin(
          frame.sessionId,
          buffer,
          (responsePayload) => {
            call.write({
              sessionId: frame.sessionId,
              type: EventType.DATA,
              payload: responsePayload
            });
          },
          () => {
            // Logic to disconnect user? 
            // Send DISCONNECT event back to Gateway or just let it expire?
            // Typically we send a request to Gateway to close socket.
            // For now, we can perhaps send a generic 'close' packet or just ignore.
            // The Gateway handles the socket.
            // We can send a Frame with type DISCONNECT to signal gateway?
            // The Protocol definition probably expects specific control flow.
            // Let's assume sending empty disconnect frame triggers it.
            call.write({
              sessionId: frame.sessionId,
              type: EventType.DISCONNECT,
              payload: Buffer.alloc(0)
            });
          }
        );
      }
    }

    switch (frame.type) {
      case EventType.CONNECT:
        console.log(`Client [${frame.sessionId}] Connected via Gateway.`);
        break;
      case EventType.DISCONNECT:
        console.log(`Client [${frame.sessionId}] Disconnected.`);
        break;
      case EventType.DATA:
        // Already handled above
        break;
    }
  }
}
