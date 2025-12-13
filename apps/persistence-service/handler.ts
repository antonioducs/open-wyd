import { SQSEvent, SQSHandler, Context } from 'aws-lambda';
import { connectToDatabase, PlayerModel } from '@repo/database';
import { GameEvent } from '@repo/protocol';

export const consumer: SQSHandler = async (event: SQSEvent, context: Context) => {
    context.callbackWaitsForEmptyEventLoop = false; // Important for Mongo Reuse

    console.log('Received SQS Event:', JSON.stringify(event, null, 2));

    try {
        const db = await connectToDatabase();

        for (const record of event.Records) {
            const body = JSON.parse(record.body) as GameEvent;
            console.log('Processing message:', body);

            if (body.type === 'SAVE_PLAYER') {
                await PlayerModel.updateOne(
                    { name: body.payload.name },
                    { $set: { ...body.payload, updatedAt: new Date() } },
                    { upsert: true }
                );
                console.log(`Player ${body.payload.name} saved/updated.`);
            }
        }
    } catch (error) {
        console.error('Error processing SQS batch:', error);
        throw error; // Let Lambda retry
    }
};
