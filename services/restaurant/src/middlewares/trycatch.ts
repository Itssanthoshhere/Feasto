import { Request, Response, RequestHandler, NextFunction } from "express";

const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Internal Server Error";
      res.status(500).json({
        message,
      });
    }
  };
};

export default TryCatch;
