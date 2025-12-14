import {
    readLoginPacket,
    writeMessagePacket,
} from '@repo/protocol';
import { logger } from '@repo/logger';
import { AccountRepository } from '@repo/database';
import { loginMessages } from '../../../constants/messages/login-messages';

export const handleLogin = async (
    sessionId: string,
    payload: Buffer,
    sendPacket: (payload: Buffer) => void,
    disconnect: () => void
) => {
    try {
        const loginData = readLoginPacket(payload);
        const { username, password } = loginData;

        logger.info(`[Login] Request for ${username} (Session: ${sessionId})`);

        const account = await AccountRepository.authenticate(username, password);
        if (!account) {
            logger.info(`[Login] Failed auth for ${username}`);
            sendPacket(writeMessagePacket(loginMessages.INVALID_CREDENTIALS));
            disconnect();
            return;
        }

        if (account.banned) {
            sendPacket(writeMessagePacket(loginMessages.ACCOUNT_BLOCKED));
            disconnect();
            return;
        }

        sendPacket(writeMessagePacket("Teste de recebimento de mensagem."));
    } catch (error) {
        logger.error({ error }, '[Login] Error processing packet:');
        sendPacket(writeMessagePacket(loginMessages.SERVER_ERROR));
        disconnect();
    }
};
