import * as net from 'net';
import { randomUUID } from 'crypto';
import { logger } from '@repo/logger';
import { ClientSession } from './session';
import { IpBlacklist } from '../security/tokenBucket';

export class TcpGateway {
  private server: net.Server;
  private sessions: Map<string, ClientSession>;

  constructor(port: number) {
    this.sessions = new Map();
    this.server = net.createServer((socket) => this.onConnection(socket));

    this.server.listen(port, () => {
      logger.info({ port }, 'TCP Gateway Started');
    });
  }

  private onConnection(socket: net.Socket) {
    const sessionId = randomUUID();
    const ip = socket.remoteAddress;

    logger.info({ sessionId, ip }, 'Client Connected');

    if (ip && IpBlacklist.getInstance().isBlacklisted(ip)) {
      logger.warn({ sessionId, ip }, 'Connection rejected: IP is blacklisted');
      socket.destroy();
      return;
    }

    const session = new ClientSession(sessionId, socket);
    this.sessions.set(sessionId, session);

    socket.on('close', () => {
      this.sessions.delete(sessionId);
    });
  }

  public stop() {
    this.server.close();
  }
}
