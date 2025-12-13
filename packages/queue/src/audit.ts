import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const AUDIT_QUEUE_URL = process.env.AUDIT_QUEUE_URL || "http://localhost:4566/000000000000/wyd-audit-logs";

// Re-using the client from index.ts is better for connection pooling, 
// but for now creating a shared client instance to be exported or used here.
// Let's modify index.ts to export the client or reuse this logic.
// Ideally, we move the SQS client creation to a shared standard file.

const client = new SQSClient({
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: process.env.SQS_ENDPOINT || "http://localhost:4566",
    credentials: {
        accessKeyId: "test",
        secretAccessKey: "test"
    }
});

export interface AuditLogEntry {
    actorId: string;
    action: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    timestamp?: number;
}

export const sendAuditLog = async (entry: AuditLogEntry) => {
    try {
        const command = new SendMessageCommand({
            QueueUrl: AUDIT_QUEUE_URL,
            MessageBody: JSON.stringify({ ...entry, timestamp: Date.now() }),
        });
        // Fire and forget usually for logs, but let's await to ensure reliability in this context
        await client.send(command);
        console.log(`Audit log sent: ${entry.action} by ${entry.actorId}`);
    } catch (error) {
        console.error("Error sending audit log:", error);
        // Silent fail for logs? Or throw? Throwing for now to match dev environment visibility.
        throw error;
    }
};
