import { DATA_SIZES } from '../constants';
import { IPackage } from '../ipackage';

export class INT implements IPackage {
  private _value = 0;
  size = DATA_SIZES.INT;

  constructor(value?: number) {
    if (value) {
      this._value = value;
    }
  }

  set value(value: number) {
    this._value = value;
  }

  fromBuffer(buffer: Buffer): void {
    this._value = buffer.readInt32BE();
  }

  get value() {
    return this._value;
  }

  get buffer(): Buffer {
    const buffer = Buffer.alloc(this.size);

    buffer.writeInt32BE(this._value, 0);

    return buffer;
  }
}
