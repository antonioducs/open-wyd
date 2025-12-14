import { env } from './constants/env';
import { QueueRepositorySingleton } from './presentation/singletons/queue-repository-singleton';
import { GameEvent } from '@repo/protocol';

import { RpcServer } from './presentation/network/rpcServer';

const startLoop = () => {
  console.log('Starting Timer Server Loop...');

  // Start gRPC Server
  const RPC_PORT = env.RPC_PORT;
  const rpcServer = new RpcServer(RPC_PORT);
  rpcServer.start();

  // ... Rest of the loop

  let counter = 0;

  setInterval(async () => {
    counter++;
    const event: GameEvent = {
      type: 'SAVE_PLAYER',
      payload: {
        name: `Player_${Math.floor(Math.random() * 10)}`,
        level: Math.floor(Math.random() * 100),
        exp: counter * 100,
      },
      timestamp: Date.now(),
    };

    console.log(`[${counter}] Sending Save Event for ${event.payload.name}`);
    QueueRepositorySingleton.getInstance().gameEvents(event);
  }, 5000); // Send every 5 seconds
};

startLoop();
