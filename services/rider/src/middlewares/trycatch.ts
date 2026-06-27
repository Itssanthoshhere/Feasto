import { Request, Response, RequestHandler, NextFunction } from "express";

const TryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err: any) {
      console.error("Backend Error:", err?.response?.data || err);
      const message =
        err?.response?.data?.message || err.message || "Internal Server Error";
      const statusCode = err?.response?.status || 500;
      res.status(statusCode).json({
        message,
      });
    }
  };
};

export default TryCatch;
