import { TcpGateway } from './tcp/gateway';

const startGateway = async () => {
  console.log('Starting Connect Server (Gateway)...');

  const PORT = 3000; // Default port
  const gateway = new TcpGateway(PORT);

  // Graceful shutdown
  process.on('SIGSIGINT', () => {
    gateway.stop();
    process.exit(0);
  });
};

startGateway();
