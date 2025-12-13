
import * as grpc from '@grpc/grpc-js';
import { GameLinkService, GameLinkClient, PacketFrame, EventType } from '@repo/protocol';

export class RpcClient {
    private client: GameLinkClient;
    private stream: grpc.ClientDuplexStream<PacketFrame, PacketFrame> | null = null;
    private isConnected: boolean = false;

    constructor(private targetAddress: string = 'localhost:50051') {
        // Create the client instance using the generated service definition
        // Note: Generic client creation might vary based on generated code structure.
        // Since we mocked GameLinkService object, we use makeGenericClientConstructor or raw client.

        const ClientClass = grpc.makeGenericClientConstructor(GameLinkService, 'GameLinkService');
        // @ts-ignore - The mock/manual types might assume a specific structure, but this is standard grpc-js
        this.client = new ClientClass(targetAddress, grpc.credentials.createInsecure()) as unknown as GameLinkClient;
    }

    public connect() {
        console.log(`Connecting to Game Server at ${this.targetAddress}...`);

        // Start the bi-directional stream
        this.stream = this.client.stream();

        this.stream.on('data', (frame: PacketFrame) => {
            this.handleFrame(frame);
        });

        this.stream.on('end', () => {
            console.log('Game Server Stream Ended.');
            this.isConnected = false;
            // Reconnect logic would go here
        });

        this.stream.on('error', (err) => {
            console.error('Game Server Stream Error:', err);
            this.isConnected = false;
        });

        this.isConnected = true;
        console.log('Connected to Game Server.');
    }

    public sendPacket(sessionId: string, payload: Buffer, type: EventType = EventType.DATA) {
        if (!this.stream || !this.isConnected) {
            console.warn('Cannot send packet, Game Server not connected.');
            return;
        }

        const frame: PacketFrame = {
            sessionId,
            payload,
            type
        };

        this.stream.write(frame);
    }

    private handleFrame(frame: PacketFrame) {
        // This typically goes back to the TCP socket associated with frame.sessionId
        console.log(`Received Frame from Logic for [${frame.sessionId}]`);
    }
}
