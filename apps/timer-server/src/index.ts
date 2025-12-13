import { sendToQueue } from '@repo/queue';
import { GameEvent } from '@repo/protocol';

import { RpcServer } from './network/rpcServer';

const startLoop = () => {
  console.log('Starting Timer Server Loop...');

  // Start gRPC Server
  const rpcServer = new RpcServer();
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
    await sendToQueue(event);

    // Random Audit Log
    if (counter % 3 === 0) {
      const { sendAuditLog } = await import('@repo/queue'); // ensuring we get the new export
      await sendAuditLog({
        actorId: event.payload.name,
        action: 'GM_CMD',
        details: { command: '/item 400 15' },
        ipAddress: '127.0.0.1',
      });
    }
  }, 5000); // Send every 5 seconds
};

startLoop();
