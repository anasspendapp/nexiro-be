import { Model, Optional } from "sequelize";
export interface IPlan {
    id: number;
    name: string;
    price: number;
    credits: number;
    description?: string;
    isActive: boolean;
    priceBookId: number;
    createdAt: Date;
    updatedAt: Date;
}
interface PlanCreationAttributes extends Optional<IPlan, "id" | "description" | "isActive" | "createdAt" | "updatedAt"> {
}
export declare class Plan extends Model<IPlan, PlanCreationAttributes> implements IPlan {
    id: number;
    name: string;
    price: number;
    credits: number;
    description?: string;
    isActive: boolean;
    priceBookId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static getActivePlans(): Promise<Plan[]>;
    static getPlanByName(name: string): Promise<Plan | null>;
}
export {};
//# sourceMappingURL=plan.model.d.ts.map