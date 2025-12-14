export const calcPacketSize = (props: object) => {
  let size = 0;

  Object.entries(props).map((item) => {
    const value = item[1];

    if (value.size) {
      size += value.size;
    }
  });

  return size;
};
