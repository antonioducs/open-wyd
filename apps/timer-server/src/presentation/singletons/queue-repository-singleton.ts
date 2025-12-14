import { SQSQueueRepository } from "@repo/queue";
import { IQueueRepository } from "@repo/queue/dist/repository/iqueue_repository";

export class QueueRepositorySingleton {
    private static instance: IQueueRepository;
    private constructor() { }

    public static getInstance(): IQueueRepository {
        if (!QueueRepositorySingleton.instance) {
            QueueRepositorySingleton.instance = new SQSQueueRepository();
        }
        return QueueRepositorySingleton.instance;
    }
}
