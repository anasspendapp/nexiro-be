import { Request, Response } from "express";
import { AuthRequest } from "../utils/auth.middleware";
export declare const userController: {
    getAllUsers: (req: Request, res: Response) => Promise<void>;
    getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createUser: (req: Request, res: Response) => Promise<void>;
    updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCreditBalance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    googleAuth: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCurrentUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateMyReferralCode: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    sendTestEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=user.controller.d.ts.map