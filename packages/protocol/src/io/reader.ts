export class BinaryReader {
    private buffer: Buffer;
    private offset: number;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    public readUInt8(): number {
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }

    public readUInt16(): number {
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }

    public readUInt32(): number {
        const value = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }

    public readInt32(): number {
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }

    public readString(length: number): string {
        if (length <= 0) return '';

        // Read the slice of the buffer
        const end = this.offset + length;
        if (end > this.buffer.length) {
            throw new RangeError('Index out of range');
        }

        // Convert to latin1 string
        let str = this.buffer.toString('latin1', this.offset, end);

        // Trim null bytes from the end
        // Note: C++ often fills garbage after the null terminator if the buffer wasn't zeroed.
        // We should look for the first null terminator and only take up to that point.
        const nullIndex = str.indexOf('\0');
        if (nullIndex !== -1) {
            str = str.substring(0, nullIndex);
        }

        this.offset += length;
        return str;
    }

    public skip(length: number): void {
        this.offset += length;
    }

    public remaining(): number {
        return Math.max(0, this.buffer.length - this.offset);
    }

    public getOffset(): number {
        return this.offset;
    }
}
