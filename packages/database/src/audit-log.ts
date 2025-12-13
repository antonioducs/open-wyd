import mongoose from 'mongoose';

export enum AuditAction {
    TRADE = 'TRADE',
    GM_CMD = 'GM_CMD',
    DROP = 'DROP',
    PVP_KILL = 'PVP_KILL',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT'
}

const AuditLogSchema = new mongoose.Schema({
    actorId: { type: String, required: true, index: true },
    action: { type: String, enum: Object.values(AuditAction), required: true, index: true },
    targetId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }, // Flexible JSON payload
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
});

// TTL Index: Expire after 90 days (7776000 seconds)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);
