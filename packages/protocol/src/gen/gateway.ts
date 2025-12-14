import * as grpc from '@grpc/grpc-js';

export const protobufPackage = 'gateway';

export enum EventType {
  DATA = 0,
  CONNECT = 1,
  DISCONNECT = 2,
  UNRECOGNIZED = -1,
}

export interface PacketFrame {
  sessionId: string;
  payload: Buffer;
  type: EventType;
}

// Service Definition for @grpc/grpc-js
export const GameLinkService = {
  stream: {
    path: '/gateway.GameLink/Stream',
    requestStream: true,
    responseStream: true,
    requestSerialize: (value: PacketFrame) => Buffer.from(JSON.stringify(value)), // MOCK SERIALIZATION for now since we don't have protobufjs
    requestDeserialize: (value: Buffer) => JSON.parse(value.toString()) as PacketFrame,
    responseSerialize: (value: PacketFrame) => Buffer.from(JSON.stringify(value)),
    responseDeserialize: (value: Buffer) => JSON.parse(value.toString()) as PacketFrame,
  },
} as const;

export interface GameLinkServer extends grpc.UntypedServiceImplementation {
  stream: grpc.handleBidiStreamingCall<PacketFrame, PacketFrame>;
}

export type GameLinkClient = grpc.Client & {
  stream(
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientDuplexStream<PacketFrame, PacketFrame>;
};
