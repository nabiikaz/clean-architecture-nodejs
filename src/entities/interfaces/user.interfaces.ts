import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    readonly _id: any;
    readonly username: string;
    readonly password: string;
    readonly date: Date;
}
