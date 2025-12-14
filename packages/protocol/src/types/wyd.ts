import { BinaryWriter } from '../io/binary-writer';

/**
 * Represents the 16-byte Item Structure (Legacy: sItem)
 * For now, just a placeholder of raw bytes or minimal fields.
 */
export interface IItem {
    id: number;
    effect: number;
    doom: number;
    // TODO: Add remaining fields when needed. 
    // Total size must be 16 bytes.
}

/**
 * Writes a placeholder Item structure (16 bytes)
 */
export function writeItem(writer: BinaryWriter, item?: IItem): void {
    if (item) {
        writer.writeUInt16(item.id);
        writer.writeUInt16(item.effect);
        writer.writeUInt16(item.doom);
        writer.writeBytes(Buffer.alloc(10)); // Padding to reach 16 bytes
    } else {
        writer.writeBytes(Buffer.alloc(16)); // Empty item
    }
}

/**
 * Represents the Status Structure (Legacy: sStatus)
 * Used for attributes like Str, Int, Dex, Con
 */
export interface IStatus {
    str: number;
    int: number;
    dex: number;
    con: number;
}

/**
 * Writes a placeholder Status structure 
 * Legacy struct is often larger, but for charlist we need to match exact C++ size.
 * Assuming standard 4 attribute shorts + special handling if needed.
 * For p10A context, it's often just the 4 stats (8 bytes) or a full struct?
 * Based on 'sStatus' usage in CharList, let's assume 4x UInt16 for basic stats for now.
 * NOTE: Adjust size if legacy struct is determined to be larger.
 */
export function writeStatus(writer: BinaryWriter, status?: IStatus): void {
    if (status) {
        writer.writeUInt16(status.str);
        writer.writeUInt16(status.int);
        writer.writeUInt16(status.dex);
        writer.writeUInt16(status.con);
    } else {
        writer.writeUInt16(0);
        writer.writeUInt16(0);
        writer.writeUInt16(0);
        writer.writeUInt16(0);
    }
}
