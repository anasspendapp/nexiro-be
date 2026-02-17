import { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
        fullName?: string;
        role?: string;
    };
}
export declare const verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const verifyAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const verifyAdminToken: ((req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined)[];
export declare const verifyUser: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const verifyUserToken: ((req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined)[];
export declare const verifySelfAccess: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map