import { HeaderStruct } from '../header';
import { createPacketFromBuffer } from '../helpers/createPacketFromBuffer';
import { CHAR, WORD } from '../primitivies';

export function readLoginPacket(buffer: Buffer) {
  let receivedPacket = {
    header: new HeaderStruct(),
    password: new CHAR(10),
    unk: new WORD(),
    username: new CHAR(12),
  };
  receivedPacket = createPacketFromBuffer(receivedPacket, buffer);

  return {
    username: receivedPacket.username.value,
    password: receivedPacket.password.value,
  };
}
