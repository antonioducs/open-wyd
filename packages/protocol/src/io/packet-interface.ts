export interface IPacketHeader {
    size: number;
    type: number;
    encrypted?: boolean; // Optional depending on implementation
}

export interface IPacket {
    header: IPacketHeader;
}
