import { Model, Optional } from "sequelize";
export interface IUser {
    id: number;
    email: string;
    fullName?: string;
    image?: string;
    passwordHash?: string;
    googleId?: string;
    isVerified: boolean;
    googleDriveFolderId?: string;
    creditBalance: number;
    planId?: number;
    referralCode: string;
    referredById?: number;
    createdAt: Date;
    updatedAt: Date;
}
interface UserCreationAttributes extends Optional<IUser, "id" | "fullName" | "passwordHash" | "googleId" | "isVerified" | "googleDriveFolderId" | "creditBalance" | "planId" | "referralCode" | "referredById" | "createdAt" | "updatedAt"> {
}
export declare class User extends Model<IUser, UserCreationAttributes> implements IUser {
    id: number;
    email: string;
    fullName?: string;
    image?: string;
    passwordHash?: string;
    googleId?: string;
    isVerified: boolean;
    googleDriveFolderId?: string;
    creditBalance: number;
    planId?: number;
    referralCode: string;
    referredById?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=user.model.d.ts.map