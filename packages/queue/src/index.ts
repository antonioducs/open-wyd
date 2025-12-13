import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const SQS_QUEUE_URL =
  process.env.SQS_QUEUE_URL || 'http://localhost:4566/000000000000/wyd-game-events';

const client = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.SQS_ENDPOINT || 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

export const sendToQueue = async (body: any) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      MessageBody: JSON.stringify(body),
    });
    const response = await client.send(command);
    console.log('Message sent to SQS:', response.MessageId);
    return response;
  } catch (error) {
    console.error('Error sending message to SQS:', error);
    throw error;
  }
};

export * from './audit';
