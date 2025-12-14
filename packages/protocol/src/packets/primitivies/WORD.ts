import { DATA_SIZES } from '../constants';
import { IPackage } from '../ipackage';

export class WORD implements IPackage {
  private _value = 0;
  size = DATA_SIZES.WORD;

  constructor(value?: number) {
    if (value) {
      this._value = value;
    }
  }

  set value(value: number) {
    this._value = value;
  }

  fromBuffer(buffer: Buffer): void {
    this._value = buffer.readInt16LE();
  }

  get value() {
    return this._value;
  }

  get buffer(): Buffer {
    const buffer = Buffer.alloc(this.size);

    buffer.writeInt16LE(this._value, 0);

    return buffer;
  }
}
