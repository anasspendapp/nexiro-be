import { Request, Response } from "express";
export declare const priceBookController: {
    getAllPriceBooks: (req: Request, res: Response) => Promise<void>;
    getCurrentPrice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getCurrentPlans: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPlanByName: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getPriceBookById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createPriceBook: (req: Request, res: Response) => Promise<void>;
    updatePriceBook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deletePriceBook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=price-book.controller.d.ts.map