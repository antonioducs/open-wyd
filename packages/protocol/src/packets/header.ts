export interface IPacketHeader {
    size: number;
    packetId: number;
}

// Usually WYD stores size in the first 2 bytes.
export const PACKET_HEADER_SIZE = 2;
