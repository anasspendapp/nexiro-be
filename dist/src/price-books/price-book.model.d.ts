import { Model, Optional } from "sequelize";
export interface IPriceBook {
    id: number;
    versionTag: string;
    creditsPerEnhancement: number;
    effectiveFrom: Date;
    termsOfService: string;
    createdAt: Date;
    updatedAt: Date;
}
interface PriceBookCreationAttributes extends Optional<IPriceBook, "id" | "creditsPerEnhancement" | "effectiveFrom" | "createdAt" | "updatedAt"> {
}
export declare class PriceBook extends Model<IPriceBook, PriceBookCreationAttributes> implements IPriceBook {
    id: number;
    versionTag: string;
    creditsPerEnhancement: number;
    effectiveFrom: Date;
    termsOfService: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly plans?: any[];
    getPlanByName(planName: string): Promise<any | undefined>;
    static getCurrentPrice(): Promise<PriceBook | null>;
}
export {};
//# sourceMappingURL=price-book.model.d.ts.map