import { DATA_SIZES } from '../constants';
import { IPackage } from '../ipackage';

export class DWORD implements IPackage {
  private _value = 0;
  size = DATA_SIZES.DWORD;

  constructor(value?: number) {
    if (value) {
      this._value = value;
    }
  }

  fromBuffer(buffer: Buffer): void {
    this._value = buffer.readInt32LE();
  }

  set value(value: number) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  get buffer(): Buffer {
    const buffer = Buffer.alloc(this.size);

    buffer.writeInt32LE(this._value, 0);

    return buffer;
  }
}
