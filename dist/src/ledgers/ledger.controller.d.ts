import { Request, Response } from "express";
export declare const ledgerController: {
    getAllEntries: (req: Request, res: Response) => Promise<void>;
    getEntriesByUserId: (req: Request, res: Response) => Promise<void>;
    getEntryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createEntry: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getBalanceHistory: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=ledger.controller.d.ts.map