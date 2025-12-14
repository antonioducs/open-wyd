import { BYTE, DWORD, WORD } from './primitivies';
import { calcPacketSize } from './helpers/calcPackageSize';
import { createPacketBuffer } from './helpers/createPacketBuffer';
import { createPacketFromBuffer } from './helpers/createPacketFromBuffer';
import { IPackage } from './ipackage';

type Props = {
  size: WORD;
  key: BYTE;
  checksum: BYTE;
  packetId: WORD;
  clientId: WORD;
  timeStamp: DWORD;
};

export class HeaderStruct implements IPackage {
  private props: Props;
  size = 0;

  constructor(buffer?: Buffer) {
    this.props = {
      size: new WORD(),
      key: new BYTE(),
      checksum: new BYTE(),
      packetId: new WORD(),
      clientId: new WORD(),
      timeStamp: new DWORD(),
    };

    this.props.key.value = Math.round(Math.random() * 256);
    this.props.timeStamp.value = Math.floor(Date.now() / 1000);

    this.size = calcPacketSize(this.props);

    if (buffer) {
      this.fromBuffer(buffer);
    }
  }

  fromBuffer(buffer: Buffer): void {
    this.props = createPacketFromBuffer(this.props, buffer);
  }

  get buffer(): Buffer {
    const buffer = createPacketBuffer(this.props);
    return buffer;
  }

  set packetSize(value: number) {
    this.props.size.value = value;
  }

  set key(value: number) {
    this.props.key.value = value;
  }
  set checksum(value: number) {
    this.props.checksum.value = value;
  }
  set packetId(value: number) {
    this.props.packetId.value = value;
  }
  set clientId(value: number) {
    this.props.clientId.value = value;
  }
  set timeStamp(value: number) {
    this.props.timeStamp.value = value;
  }

  get packetSize() {
    return this.props.size.value;
  }
  get key() {
    return this.props.key.value;
  }
  get checksum() {
    return this.props.checksum.value;
  }
  get packetId() {
    return this.props.packetId.value;
  }
  get clientId() {
    return this.props.clientId.value;
  }
  get timeStamp() {
    return this.props.timeStamp.value;
  }
}
