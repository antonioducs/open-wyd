import { AuditLogEntry } from '../types/audit-log-entry';
import { GameEventEntry } from '../types/game-event-entry';

export interface IQueueRepository {
  auditLog(entry: AuditLogEntry): void;
  gameEvents(event: GameEventEntry): void;
}
