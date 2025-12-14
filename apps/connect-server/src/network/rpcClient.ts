import * as grpc from '@grpc/grpc-js';
import { GameLinkService, GameLinkClient, PacketFrame, EventType } from '@repo/protocol';
import { logger } from '@repo/logger';
import { ClientSession } from '../tcp/session';
export class RpcClient {
  private client: GameLinkClient;
  private stream: grpc.ClientDuplexStream<PacketFrame, PacketFrame> | null = null;
  private isConnected: boolean = false;

  constructor(private targetAddress: string, private sessions: Map<string, ClientSession>) {
    // Create the client instance using the generated service definition
    // Note: Generic client creation might vary based on generated code structure.
    // Since we mocked GameLinkService object, we use makeGenericClientConstructor or raw client.

    const ClientClass = grpc.makeGenericClientConstructor(GameLinkService, 'GameLinkService');
    // @ts-ignore - The mock/manual types might assume a specific structure, but this is standard grpc-js
    this.client = new ClientClass(
      targetAddress,
      grpc.credentials.createInsecure(),
    ) as unknown as GameLinkClient;
  }

  public connect() {
    logger.info(`Connecting to Game Server at ${this.targetAddress}...`);

    // Start the bi-directional stream
    this.stream = this.client.stream();

    this.stream.on('data', (frame: PacketFrame) => {
      this.handleFrame(frame);
    });

    this.stream.on('end', () => {
      logger.info('Game Server Stream Ended.');
      this.isConnected = false;
      // Reconnect logic would go here
    });

    this.stream.on('error', (err) => {
      logger.error({ error: err }, 'Game Server Stream Error');
      this.isConnected = false;
    });

    this.isConnected = true;
    logger.info('Connected to Game Server.');
  }

  public sendPacket(sessionId: string, payload: Buffer, type: EventType = EventType.DATA) {
    if (!this.stream || !this.isConnected) {
      logger.warn('Cannot send packet, Game Server not connected.');
      return;
    }

    const frame: PacketFrame = {
      sessionId,
      payload,
      type,
    };

    this.stream.write(frame);
  }

  private handleFrame(frame: PacketFrame) {
    logger.info(`Received Frame from Logic for [${frame.sessionId}]`);

    const session = this.sessions.get(frame.sessionId);
    if (!session) {
      logger.warn(`No session found for [${frame.sessionId}]`);
      return;
    }

    session.send(frame.payload);
  }
}
