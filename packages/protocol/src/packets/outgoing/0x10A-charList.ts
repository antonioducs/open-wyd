import { BinaryWriter } from '../../io/binary-writer';
import { IItem, IStatus, writeItem, writeStatus } from '../../types/wyd';

export interface ICharacterSummary {
    name: string;
    posX: number;
    posY: number;
    status: IStatus;
    equip: IItem[]; // Should be length 16
    guildIndex: number;
    gold: number;
    exp: number;
}

/**
 * Writes the Character List (0x10A) packet.
 * STRICT PACKET LAYOUT (Structure of Arrays):
 * Header (12)
 * Unused1 (20)
 * PosX[4]
 * PosY[4]
 * Name[4]
 * Status[4]
 * Equip[4][16]
 * GuildIndex[4]
 * Gold[4]
 * Exp[4]
 * Unused2[4]
 * Banco[120]
 */
export function writeCharListPacket(characters: (ICharacterSummary | null)[]): Buffer {
    const writer = new BinaryWriter();

    // Calculate size? 
    // It's a large fixed size packet. Legacy p10A is typically ~2900-3000 bytes depending on version.
    // Let's rely on the writer to track size, but we must write exact fields.
    // We'll write a placeholder header first, then patch size later if needed, 
    // but BinaryWriter typically handles dynamic buffer. 
    // However, Protocol usually expects exact size. 
    // Let's implement writing and see resulting size.

    writer.writeHeader(0, 0x10A); // Size 0 placeholder

    // Unused1: 20 bytes
    writer.writeBytes(Buffer.alloc(20));

    // Ensure we have exactly 4 slots
    const slots = [0, 1, 2, 3];

    // 1. PosX[4] (UInt16)
    slots.forEach(i => {
        writer.writeUInt16(characters[i]?.posX || 0);
    });

    // 2. PosY[4] (UInt16)
    slots.forEach(i => {
        writer.writeUInt16(characters[i]?.posY || 0);
    });

    // 3. Name[4] (String 16)
    slots.forEach(i => {
        writer.writeString(characters[i]?.name || '', 16);
    });

    // 4. Status[4] (Status struct)
    slots.forEach(i => {
        writeStatus(writer, characters[i]?.status);
    });

    // 5. Equip[4][16] (Item struct)
    slots.forEach(i => {
        const equip = characters[i]?.equip || [];
        for (let j = 0; j < 16; j++) {
            writeItem(writer, equip[j]);
        }
    });

    // 6. GuildIndex[4] (UInt16)
    slots.forEach(i => {
        writer.writeUInt16(characters[i]?.guildIndex || 0);
    });

    // 7. Gold[4] (UInt32)
    slots.forEach(i => {
        writer.writeUInt32(characters[i]?.gold || 0);
    });

    // 8. Exp[4] (UInt32)
    slots.forEach(i => {
        writer.writeUInt32(characters[i]?.exp || 0);
    });

    // 9. Unused2[4] (UInt32) - Often used for learning points or similar in mods, but defined as Unused2 here
    slots.forEach(i => {
        writer.writeUInt32(0);
    });

    // 10. Banco[120] (Item struct) - Application global storage or similar? 
    // Often p10A includes cargo/storage. 120 slots.
    for (let k = 0; k < 120; k++) {
        writeItem(writer, undefined); // Empty items for now
    }

    // Patch the size in header
    // Header is first 2 bytes (UInt16 LE)
    const totalSize = writer.getBuffer().length;
    const buffer = writer.getBuffer();
    // Write UInt16LE at index 0 manually or via a patch method if we had one.
    // Polyfill patch:
    buffer[0] = totalSize & 0xFF;
    buffer[1] = (totalSize >> 8) & 0xFF;

    return buffer;
}
