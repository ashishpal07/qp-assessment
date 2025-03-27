import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";

dotenv.config();

/**
 * Middleware to authenticate a user.
 *
 * Verifies the presence of a valid authentication token in the Authorization header.
 * If the token is valid, it populates the request object with the user's data and calls the next middleware.
 * If the token is invalid, it sends a 401 Unauthorized response.
 * If no token is provided, it sends a 403 Forbidden response.
 */
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headers = req.headers["authorization"] || "";
    
    const token = headers.split(" ")[1];

    if (!token) {
      res.status(403).json({ message: "Token not provided." });
      return;
    }
    
    let decode = verifyToken(token);
    
    if (!decode) {
      res.status(401).json({ message: "Unauthorized." });
      return;
    }

    req.user = decode;
    next();
  } catch (error) {
    console.log("Error while authenticating user : ", error);
    res.status(500).json({ message: "Internal server while authorizing" });
    return;
  }
};

/**
 * Middleware to authorize admin access.
 *
 * This middleware checks if the authenticated user has an admin role.
 * If the user is not an admin, it sends a 403 Forbidden response.
 * If the user is an admin, it calls the next middleware.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 */
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = req.user.role;
    if (role !== Role.ADMIN) {
      res.status(403).json({ message: "Admin access required." });
      return;
    }
    next();
  } catch (error) {
    console.log("Error while checking user role : ", error);
    res
      .status(500)
      .json({ message: "Internal server while authorizing for admin." });
    return;
  }
};

export { authenticate, isAdmin };
