import { sendToQueue } from '@repo/queue';
import { GameEvent } from '@repo/protocol';

const startLoop = () => {
    console.log('Starting Timer Server Loop...');
    let counter = 0;

    setInterval(async () => {
        counter++;
        const event: GameEvent = {
            type: 'SAVE_PLAYER',
            payload: {
                name: `Player_${Math.floor(Math.random() * 10)}`,
                level: Math.floor(Math.random() * 100),
                exp: counter * 100
            },
            timestamp: Date.now()
        };

        console.log(`[${counter}] Sending Save Event for ${event.payload.name}`);
        await sendToQueue(event);

    }, 5000); // Send every 5 seconds
};

startLoop();
