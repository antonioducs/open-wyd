import { env } from './env';
import { TcpGateway } from './tcp/gateway';

const startGateway = async () => {
  console.log('Starting Connect Server (Gateway)...');

  const PORT = env.PORT;
  const gateway = new TcpGateway(PORT);

  // Graceful shutdown
  process.on('SIGINT', () => {
    gateway.stop();
    process.exit(0);
  });
};

startGateway();
