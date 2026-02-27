import { Request, Response } from "express";
export declare const imageTaskController: {
    getAllTasks: (req: Request, res: Response) => Promise<void>;
    getTasksByUserId: (req: Request, res: Response) => Promise<void>;
    getTaskById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createTask: (req: Request, res: Response) => Promise<void>;
    updateTaskStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=image-task.controller.d.ts.map