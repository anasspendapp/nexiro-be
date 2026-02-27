import { Model, Optional, ForeignKey } from "sequelize";
export declare enum TaskStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export interface IImageTask {
    id: number;
    userId: ForeignKey<number>;
    status: TaskStatus;
    inputDriveId?: string | null;
    outputDriveId?: string | null;
    cost: number;
    config: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface ImageTaskCreationAttributes extends Optional<IImageTask, "id" | "status" | "outputDriveId" | "config" | "createdAt" | "updatedAt"> {
}
export declare class ImageTask extends Model<IImageTask, ImageTaskCreationAttributes> implements IImageTask {
    id: number;
    userId: ForeignKey<number>;
    status: TaskStatus;
    inputDriveId?: string | null;
    outputDriveId?: string | null;
    cost: number;
    config: Record<string, any>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export {};
//# sourceMappingURL=image-task.model.d.ts.map