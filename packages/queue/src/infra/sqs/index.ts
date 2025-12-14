import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { env } from "../../constants/env";
import { IQueueRepository } from "../../repository/iqueue_repository";
import { AuditLogEntry } from "../../types/audit-log-entry";
import { GameEventEntry } from "../../types/game-event-entry";
import { logger } from "@repo/logger";

const client = new SQSClient({
    region: env.AWS_REGION,
    endpoint: env.AWS_ENDPOINT,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

export class SQSQueueRepository implements IQueueRepository {
    private async sendToQueue(queueUrl: string, entry: any): Promise<void> {
        try {
            const command = new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(entry),
            });
            await client.send(command);
        } catch (error) {
            logger.error({
                error,
                queueUrl,
                entry,
            }, 'Error sending message to SQS:');
        }
    }

    auditLog(entry: AuditLogEntry): void {
        this.sendToQueue(env.AUDIT_QUEUE_URL, entry);
    }

    gameEvents(event: GameEventEntry): void {
        this.sendToQueue(env.GAME_EVENTS_QUEUE_URL, event);
    }
}