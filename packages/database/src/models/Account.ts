import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAccount extends Document {
  username: string;
  password?: string; // Hashed
  accessLevel: number;
  banned: boolean;
  characters: any[]; // Mock for now

  comparePassword(plainText: string): Promise<boolean>;
}

const AccountSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  accessLevel: { type: Number, default: 0 },
  banned: { type: Boolean, default: false },
  characters: { type: [Object], default: [] }, // Placeholder
});

AccountSchema.methods.comparePassword = async function (plainText: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(plainText, this.password);
};

export const AccountModel = mongoose.model<IAccount>('Account', AccountSchema);
