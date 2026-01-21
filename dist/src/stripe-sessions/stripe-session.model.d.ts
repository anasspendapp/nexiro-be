import { Model, Optional, ForeignKey } from "sequelize";
export interface IStripeSession {
    id: number;
    userId: ForeignKey<number>;
    stripeId: string;
    amount: number;
    status: string;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface StripeSessionCreationAttributes extends Optional<IStripeSession, "id" | "status" | "processedAt" | "createdAt" | "updatedAt"> {
}
export declare class StripeSession extends Model<IStripeSession, StripeSessionCreationAttributes> implements IStripeSession {
    id: number;
    userId: ForeignKey<number>;
    stripeId: string;
    amount: number;
    status: string;
    processedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=stripe-session.model.d.ts.map