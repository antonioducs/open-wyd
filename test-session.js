
const { SessionManager } = require('./packages/database/dist/session-manager');
const Redis = require('ioredis');

async function testSessionConsistency() {
    const redisUrl = 'redis://localhost:6379';
    const TEST_USER = 'test-user-123';

    // Clean up
    const cleanupRedis = new Redis(redisUrl);
    await cleanupRedis.del(`session:${TEST_USER}`);
    await cleanupRedis.del(`lock:${TEST_USER}`);

    console.log('--- Starting Consistency Test ---');

    // 1. Simulate Server A (Existing Holder)
    const serverA = new SessionManager(redisUrl, 'server-A');
    await serverA.createSession(TEST_USER);
    console.log('[Server A] Created session for User.');

    // Simulate Server A listening for kicks (simplified logic for test)
    const subRedis = new Redis(redisUrl);
    subRedis.subscribe('kick:server-A');
    subRedis.on('message', async (channel, message) => {
        const payload = JSON.parse(message);
        console.log(`[Server A] Received KICK command from ${payload.sourceServerId} for ${payload.userId}`);

        // Simulate cleanup delay
        setTimeout(async () => {
            console.log('[Server A] Processing cleanup...');
            await serverA.forceClearSession(payload.userId); // In real app, this is serverA deleting its own key
            console.log('[Server A] Session cleared/released.');
        }, 1000);
    });

    // 2. Simulate Server B (New Login Attempt)
    const serverB = new SessionManager(redisUrl, 'server-B');

    console.log('[Server B] User attempting login...');
    const existingServer = await serverB.getSessionServer(TEST_USER);

    if (existingServer) {
        console.log(`[Server B] Found existing session on ${existingServer}. Initiating Kick logic.`);

        // Acquire Lock
        const locked = await serverB.acquireLock(TEST_USER);
        if (!locked) {
            console.error('[Server B] Failed to acquire lock! (Race condition test failed?)');
            process.exit(1);
        }
        console.log('[Server B] Lock acquired.');

        // Publish Kick
        await serverB.publishKickCommand(existingServer, TEST_USER);
        console.log('[Server B] Kick command sent. Waiting for release...');

        // Wait
        const released = await serverB.waitForSessionRelease(TEST_USER, 5000);

        if (released) {
            console.log('[Server B] SUCCESS! Session released. Proceeding with login.');
            await serverB.createSession(TEST_USER);
            console.log('[Server B] New session created.');
        } else {
            console.error('[Server B] FAILED. Timed out waiting for session release.');
        }
    } else {
        console.log('[Server B] No existing session (Unexpected for this test).');
    }

    // Cleanup
    subRedis.disconnect();
    serverA.close();
    serverB.close();
    cleanupRedis.disconnect();

    console.log('--- Test Complete ---');
}

testSessionConsistency().catch(console.error);
