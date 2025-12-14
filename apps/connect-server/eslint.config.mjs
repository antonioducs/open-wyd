import sharedConfig from '@repo/eslint-config';

export default [
  ...sharedConfig,
  {
    ignores: ['!**/*'], // Reset ignores if needed, or just let shared config handle it.
    // Shared config has ignores for dist/build, which is good.
  },
];
