import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repository/user.repository";

export class VerifiedUser {
  private readonly db: UserRepository;

  constructor() {
    this.db = new UserRepository();
  }

  public async checkVerifiedUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await this.db.findUserByPhoneNo(req.user?.number as string);

      if (!user?.verified) {
        return res.status(401).json({
          status: "failed",
          message:
            "User is not verifiied. Verify your account first before you can continue using our service",
        });
      }

      next();
    } catch (e) {
      next(e);
    }
  }
}
