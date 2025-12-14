import { DATA_SIZES } from '../constants';
import { IPackage } from '../ipackage';

export class BYTE implements IPackage {
  private _value = 0;
  size = DATA_SIZES.BYTE;

  constructor(value?: number) {
    if (value) {
      this._value = value;
    }
  }

  fromBuffer(buffer: Buffer): void {
    this._value = buffer[0];
  }

  set value(value: number) {
    if (value <= 255) this._value = value;
  }

  get value() {
    return this._value;
  }

  get buffer(): Buffer {
    const buffer = Buffer.from([this._value]);

    return buffer;
  }
}
