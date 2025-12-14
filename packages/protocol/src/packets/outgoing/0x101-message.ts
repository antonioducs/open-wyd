import { HeaderStruct } from "../header";
import { calcPacketSize } from "../helpers/calcPackageSize";
import { createPacketBuffer } from "../helpers/createPacketBuffer";
import { CHAR } from "../primitivies";

export function writeMessagePacket(message: string): Buffer {
    const packet = {
        header: new HeaderStruct(),
        message: new CHAR(96),
    };

    packet.header.packetId = 0x101;
    packet.message.value = message;
    packet.header.packetSize = calcPacketSize(packet);

    return createPacketBuffer(packet);
}
