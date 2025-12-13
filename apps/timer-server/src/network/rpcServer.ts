
import * as grpc from '@grpc/grpc-js';
import { GameLinkService, GameLinkServer, PacketFrame, EventType } from '@repo/protocol';

export class RpcServer {
    private server: grpc.Server;

    constructor(private port: number = 50051) {
        this.server = new grpc.Server();
    }

    public start() {
        // Add the generic service implementation
        this.server.addService(GameLinkService, {
            stream: this.handleStream.bind(this)
        });

        const bindAddr = `0.0.0.0:${this.port}`;
        this.server.bindAsync(bindAddr, grpc.ServerCredentials.createInsecure(), (err, port) => {
            if (err) {
                console.error(`Failed to bind gRPC server on ${bindAddr}`, err);
                return;
            }
            console.log(`RPC Server listening on ${bindAddr}`);
            this.server.start();
        });
    }

    private handleStream(call: grpc.ServerDuplexStream<PacketFrame, PacketFrame>) {
        console.log('New Gateway Connection established via gRPC.');

        call.on('data', (frame: PacketFrame) => {
            this.processFrame(call, frame);
        });

        call.on('end', () => {
            console.log('Gateway Connection ended.');
        });

        call.on('error', (err) => {
            console.error('gRPC Stream Error:', err);
        });
    }

    private processFrame(call: grpc.ServerDuplexStream<PacketFrame, PacketFrame>, frame: PacketFrame) {
        // Routing Logic to GameLoop would go here.
        // For now, we just echo back or log.

        switch (frame.type) {
            case EventType.CONNECT:
                console.log(`Client [${frame.sessionId}] Connected via Gateway.`);
                break;
            case EventType.DISCONNECT:
                console.log(`Client [${frame.sessionId}] Disconnected.`);
                break;
            case EventType.DATA:
                console.log(`Received Data from [${frame.sessionId}]:`, frame.payload.toString());

                // Echo back for testing
                // In real implementation, this comes from GameLoop updates
                if (frame.payload.toString().includes('PING')) {
                    call.write({
                        sessionId: frame.sessionId,
                        type: EventType.DATA,
                        payload: Buffer.from('PONG from TimerServer')
                    });
                }
                break;
        }
    }
}
