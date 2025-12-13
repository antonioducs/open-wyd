export class BinaryWriter {
  private buffer: Buffer;
  private offset: number;

  constructor(size: number = 2048) {
    this.buffer = Buffer.alloc(size);
    this.offset = 0;
  }

  private ensureCapacity(additionalBytes: number): void {
    if (this.offset + additionalBytes > this.buffer.length) {
      const newSize = Math.max(this.buffer.length * 2, this.offset + additionalBytes);
      const newBuffer = Buffer.alloc(newSize);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
  }

  public writeUInt8(value: number): void {
    this.ensureCapacity(1);
    this.buffer.writeUInt8(value, this.offset);
    this.offset += 1;
  }

  public writeUInt16(value: number): void {
    this.ensureCapacity(2);
    this.buffer.writeUInt16LE(value, this.offset);
    this.offset += 2;
  }

  public writeUInt32(value: number): void {
    this.ensureCapacity(4);
    this.buffer.writeUInt32LE(value, this.offset);
    this.offset += 4;
  }

  public writeString(value: string, length: number): void {
    this.ensureCapacity(length);
    // Write string as latin1
    const bytesWritten = this.buffer.write(value, this.offset, length, 'latin1');

    // Fill remaining with 0 (null bytes)
    if (bytesWritten < length) {
      this.buffer.fill(0, this.offset + bytesWritten, this.offset + length);
    }
    this.offset += length;
  }

  public writeBytes(buffer: Buffer): void {
    this.ensureCapacity(buffer.length);
    buffer.copy(this.buffer, this.offset);
    this.offset += buffer.length;
  }

  public getBuffer(): Buffer {
    return this.buffer.subarray(0, this.offset);
  }
}
