import { Request, Response } from "express";
export declare const planController: {
    getAllPlans: (req: Request, res: Response) => Promise<void>;
    getActivePlans: (req: Request, res: Response) => Promise<void>;
    getPlanById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPlanByName: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createPlan: (req: Request, res: Response) => Promise<void>;
    updatePlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deletePlan: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    togglePlanStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=plan.controller.d.ts.map