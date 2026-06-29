import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  restaurantId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - No auth header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Please Login - Token missing",
      });
      return;
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Please Login - Invalid or expired token",
    });
  }
};

export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Please Login",
      });
      return;
    }

    if (req.user.role !== "admin") {
      res.status(403).json({
        message: "Access denied",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({
      message: "Please Login",
    });
  }
};
