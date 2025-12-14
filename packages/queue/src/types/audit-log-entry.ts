export interface AuditLogEntry {
    actorId: string;
    action: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    timestamp?: number;
}