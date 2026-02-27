import { Request, Response } from "express";
export declare const adminUserController: {
    getAllAdminUsers: (req: Request, res: Response) => Promise<void>;
    getAdminUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createAdminUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateAdminUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteAdminUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=admin-user.controller.d.ts.map