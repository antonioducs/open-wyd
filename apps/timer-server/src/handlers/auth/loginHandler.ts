import {
    BinaryReader,
    readLoginPacket,
    writeMessagePacket,
    writeCharListPacket,
    writeItem,
    writeStatus
} from '@repo/protocol';
import { AccountRepository, getRedisClient } from '@repo/database';

export const handleLogin = async (
    sessionId: string,
    payload: Buffer,
    sendPacket: (payload: Buffer) => void,
    disconnect: () => void
) => {
    const redis = getRedisClient();
    const reader = new BinaryReader(payload);

    try {
        const loginData = readLoginPacket(reader);
        const { username, password } = loginData;

        console.log(`[Login] Request for ${username} (Session: ${sessionId})`);

        // 1. Rate Limit
        // Simple key-based rate limit
        const ip = 'mock-ip'; // We don't have IP in payload yet, would normally come from session frame
        const limitKey = `ratelimit:login:${sessionId}`;
        const isLimited = await redis.get(limitKey);
        if (isLimited) {
            sendPacket(writeMessagePacket("Too many login attempts."));
            disconnect();
            return;
        }
        await redis.set(limitKey, '1', 'EX', 3); // 3 seconds cooldown

        // 2. Auth
        const account = await AccountRepository.authenticate(username, password);
        if (!account) {
            console.log(`[Login] Failed auth for ${username}`);
            sendPacket(writeMessagePacket("Invalid username or password."));
            disconnect();
            return;
        }

        if (account.banned) {
            sendPacket(writeMessagePacket("Account is banned."));
            disconnect();
            return;
        }

        // 3. Anti-Dupe (Locking)
        const sessionKey = `session:${account._id}`;
        const existingSession = await redis.get(sessionKey);
        if (existingSession) {
            console.log(`[Login] Account ${username} already logged in.`);
            // Notify existing session to kick (Pub/Sub) - TODO
            // For now, reject logic
            sendPacket(writeMessagePacket("Account already connected."));

            // Publish Kick command
            await redis.publish('kick_channel', String(account._id));

            disconnect();
            return;
        }

        // 4. Success
        console.log(`[Login] Success for ${username}. Sending CharList.`);

        // Register Session
        await redis.set(sessionKey, sessionId, 'EX', 300); // 5 min TTL for now, refreshed by heartbeat

        // Load Characters (Mock for now as per prompt)
        // p10A structure expects Mock data.
        // We'll create    // Hardcode one char in slot 0 for demo
        const charList: (import('@repo/protocol').ICharacterSummary | null)[] = [null, null, null, null];

        if (account.characters && account.characters.length > 0) {
            // Map DB chars to slots
            // skipping mapping logic for now, using hardcoded mock
        }

        // Hardcode one char in slot 0 for demo
        charList[0] = {
            name: `Hero_${username}`,
            posX: 1000,
            posY: 1000,
            status: { str: 10, int: 10, dex: 10, con: 10 },
            equip: Array(16).fill({ id: 0, effect: 0, doom: 0 }),
            guildIndex: 0,
            gold: 1000,
            exp: 0
        };

        const response = writeCharListPacket(charList);
        sendPacket(response);

    } catch (error) {
        console.error('[Login] Error processing packet:', error);
        sendPacket(writeMessagePacket("Server Error during login."));
        disconnect();
    }
};
