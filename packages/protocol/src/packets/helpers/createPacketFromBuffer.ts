import { IPackage } from '../ipackage';

export const createPacketFromBuffer = (props: object, buffer: Buffer): any => {
  const populatedProps = {};

  Object.entries(props).map(item => {
    const value = item[1];

    if (value?.size) {
      const propertie = value as IPackage;
      propertie.fromBuffer(buffer);
      Object.assign(populatedProps, { [`${item[0]}`]: propertie });
      buffer = buffer.subarray(propertie.size);
    }
  });

  return populatedProps;
};
