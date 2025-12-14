import { calcPacketSize } from './calcPackageSize';

export const createPacketBuffer = (props: object) => {
  const buffer = Buffer.alloc(calcPacketSize(props));

  let currentByte = 0;
  Object.entries(props).map(item => {
    const value = item[1];

    if (value?.buffer instanceof Buffer) {
      const curretBuffer = value.buffer as Buffer;
      curretBuffer.copy(buffer, currentByte, 0);
      currentByte += value.size;
    }
  });

  return buffer;
};
