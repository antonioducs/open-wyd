
import { RpcClient } from './network/rpcClient';
import { EventType } from '@repo/protocol';

const startGateway = async () => {
    console.log('Starting Connect Server (Gateway)...');

    const rpcClient = new RpcClient('localhost:50051');
    rpcClient.connect();

    // Simulate a TCP client connecting after 2 seconds
    setTimeout(() => {
        const mockSessionId = 'user-tcp-socket-123';
        console.log(`New TCP Client Connected: ${mockSessionId}`);

        // Notify Logic
        rpcClient.sendPacket(mockSessionId, Buffer.from(''), EventType.CONNECT);

        // Send some data
        setTimeout(() => {
            rpcClient.sendPacket(mockSessionId, Buffer.from('PING'));
        }, 1000);

    }, 2000);
};

startGateway();
