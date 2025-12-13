
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '../../');
const protocolDir = __dirname;
const nodeModulesBin = path.join(rootDir, 'node_modules', '.bin');
const grpcToolsBin = path.join(rootDir, 'node_modules', 'grpc-tools', 'bin');

const protocPath = path.join(grpcToolsBin, 'protoc.exe');
const pluginPath = path.join(nodeModulesBin, 'protoc-gen-ts_proto.cmd');

const args = [
    `--plugin=protoc-gen-ts_proto=${pluginPath}`,
    '--ts_proto_out=./src/gen',
    '--ts_proto_opt=outputServices=grpc-js,esModuleInterop=true',
    '-I', './src/proto',
    './src/proto/gateway.proto'
];

console.log(`Executing: ${protocPath} ${args.join(' ')}`);

const child = spawn(protocPath, args, {
    cwd: protocolDir,
    stdio: 'inherit',
    shell: true
});

child.on('error', (err) => {
    console.error('Failed to start child process:', err);
    process.exit(1);
});

child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    process.exit(code);
});
