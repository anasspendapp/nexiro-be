import { Request, Response } from "express";
export declare const stripeSessionController: {
    getAllSessions: (req: Request, res: Response) => Promise<void>;
    getSessionsByUserId: (req: Request, res: Response) => Promise<void>;
    getSessionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getSessionByStripeId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createSession: (req: Request, res: Response) => Promise<void>;
    updateSessionStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=stripe-session.controller.d.ts.map