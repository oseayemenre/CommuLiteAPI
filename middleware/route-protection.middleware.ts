import { Request, Response, NextFunction } from "express";
import { IJWT } from "../interface/jwt.interface";
import { JWT } from "../utils/jwt";

import dotenv from "dotenv";

dotenv.config();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        number: string;
      };
    }
  }
}

export class RouteProtectionMiddleware {
  private readonly jwt: IJWT;
  private access_token?: string;
  private refresh_token?: string;

  constructor() {
    this.jwt = new JWT();
  }

  public async privateRoute(req: Request, res: Response, next: NextFunction) {
    try {
      this.access_token = req.cookies.access_token;
      this.refresh_token = req.cookies.refresh_token;

      if (this.refresh_token) {
        if (this.access_token) {
          this.jwt.decodeToken({
            token: this.access_token,
            secret: process.env.ACCESS_SECRET!,
          });

          return next();
        }

        const decode_refresh_token = this.jwt.decodeToken({
          token: this.refresh_token,
          secret: process.env.REFRESH_SECRET!,
        });

        this.access_token = this.jwt.createToken({
          user: {
            number: decode_refresh_token.number,
          },
          secret: process.env.ACCESS_SECRET!,
          expire: "15m",
        });

        res.cookie("access_token", this.access_token, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
        });

        req.user = decode_refresh_token;

        return next();
      }

      return res.status(401).json({
        status: "failed",
        message: "Login to access this route",
      });
    } catch (e) {
      next(e);
    }
  }
}
