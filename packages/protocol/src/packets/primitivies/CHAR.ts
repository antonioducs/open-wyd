import { DATA_SIZES } from '../constants';
import { IPackage } from '../ipackage';

export class CHAR implements IPackage {
  private _value = '';
  size = DATA_SIZES.BYTE * this.strLength;

  constructor(
    private readonly strLength: number,
    value?: string,
  ) {
    if (value != null) {
      this._value = value.substring(0, this.strLength);
    }
  }

  fromBuffer(buffer: Buffer): void {
    this._value = buffer.toString('ascii', 0, this.size).replace(/[\0]+/g, '');
  }

  set value(value: string) {
    this._value = value.substring(0, this.strLength);
  }
  get value() {
    return this._value;
  }

  get buffer(): Buffer {
    const buffer = Buffer.alloc(this.size);
    buffer.write(this._value, 0, this._value.length, 'ascii');

    return buffer;
  }
}
