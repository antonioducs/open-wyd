import { BinaryWriter } from '../../io/binary-writer';

export function writeMessagePacket(message: string): Buffer {
    const writer = new BinaryWriter();

    // Header: Size(12 + 96) = 108, Type=0x101
    writer.writeHeader(108, 0x101);

    // Message: char[96]
    writer.writeString(message, 96);

    return writer.getBuffer();
}
