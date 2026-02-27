import { Model, Optional, ForeignKey } from "sequelize";
export declare enum TransactionType {
    CREDIT = "credit",
    DEBIT = "debit"
}
export interface ILedger {
    id: number;
    userId: ForeignKey<number>;
    type: TransactionType;
    amount: number;
    balanceAfter: number;
    referenceId?: number;
    referenceModel?: string;
    description?: string;
    timestamp: Date;
}
interface LedgerCreationAttributes extends Optional<ILedger, "id" | "referenceId" | "referenceModel" | "description" | "timestamp"> {
}
export declare class Ledger extends Model<ILedger, LedgerCreationAttributes> implements ILedger {
    id: number;
    userId: ForeignKey<number>;
    type: TransactionType;
    amount: number;
    balanceAfter: number;
    referenceId?: number;
    referenceModel?: string;
    description?: string;
    timestamp: Date;
}
export {};
//# sourceMappingURL=ledger.model.d.ts.map