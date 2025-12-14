
export class TokenBucket {
    private capacity: number;
    private tokens: number;
    private refillRate: number; // Tokens per second
    private lastRefill: number;

    constructor(capacity: number, refillRate: number) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.refillRate = refillRate;
        this.lastRefill = Date.now();
    }

    public consume(cost: number = 1): boolean {
        this.refill();

        if (this.tokens >= cost) {
            this.tokens -= cost;
            return true;
        }

        return false;
    }

    private refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000; // seconds

        if (elapsed > 0) {
            const addedTokens = elapsed * this.refillRate;
            this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
            this.lastRefill = now;
        }
    }
}

export class IpBlacklist {
    private static instance: IpBlacklist;
    private blacklist: Map<string, number>; // IP -> Expiry Timestamp

    private constructor() {
        this.blacklist = new Map();
    }

    public static getInstance(): IpBlacklist {
        if (!IpBlacklist.instance) {
            IpBlacklist.instance = new IpBlacklist();
        }
        return IpBlacklist.instance;
    }

    public add(ip: string, durationSeconds: number = 300) {
        const expiry = Date.now() + durationSeconds * 1000;
        this.blacklist.set(ip, expiry);

        // Auto cleanup logic could be added here or lazily handled in isBlacklisted
    }

    public isBlacklisted(ip: string): boolean {
        const expiry = this.blacklist.get(ip);
        if (!expiry) return false;

        if (Date.now() > expiry) {
            this.blacklist.delete(ip);
            return false;
        }

        return true;
    }
}
