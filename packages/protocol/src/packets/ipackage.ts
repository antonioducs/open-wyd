import { HeaderStruct } from "./header";

export interface IPackage {
  size: number;
  get buffer(): Buffer;
  fromBuffer(buffer: Buffer): void;
}
