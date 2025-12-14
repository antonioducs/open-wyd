import { AccountModel, IAccount } from '../models/Account';

export class AccountRepository {

    static async findByUsername(username: string): Promise<IAccount | null> {
        return AccountModel.findOne({ username }).exec();
    }

    static async authenticate(username: string, plainPass: string): Promise<IAccount | null> {
        const account = await this.findByUsername(username);
        if (!account) return null;

        const isMatch = await account.comparePassword(plainPass);
        if (!isMatch) return null;

        return account;
    }

    static async createMock(username: string, pass: string): Promise<IAccount> {
        // Helper to seed data if needed
        // const hashed = await bcrypt.hash(pass, 10);
        // return AccountModel.create({ username, password: hashed });
        // Ignoring implementation for now to avoid auto-importing bcrypt in this static method if not needed immediately
        throw new Error("Not implemented");
    }
}
