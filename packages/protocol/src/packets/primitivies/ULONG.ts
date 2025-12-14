import { DATA_SIZES } from '../constants';
import { IPackage } from '../ipackage';

export class ULONG implements IPackage {
  private _value: bigint = BigInt(0);
  size = DATA_SIZES.ULONG;

  constructor(value?: bigint) {
    if (value) {
      this._value = value;
    }
  }

  set value(value: bigint) {
    this._value = value;
  }

  fromBuffer(buffer: Buffer): void {
    this._value = buffer.readBigUint64LE();
  }

  get value() {
    return this._value;
  }

  get buffer(): Buffer {
    const buffer = Buffer.alloc(this.size);

    buffer.writeBigUInt64LE(this._value, 0);

    return buffer;
  }
}
