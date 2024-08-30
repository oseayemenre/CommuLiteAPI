import { NextFunction, Request, Response } from "express";
import { controller, httpPatch, httpPost } from "inversify-express-utils";
import { IUserService } from "../interface/user.interface";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import {
  createAccountSchema,
  setupUserSchema,
  verifyOTPSchema,
} from "../schema/user.schema";
import { inject } from "inversify";
import { INTERFACE_TYPE } from "../utils/dependency";
import { RouteProtectionMiddleware } from "../middleware/route-protection.middleware";
import { Multer } from "../utils/multer";
import { VerifiedUser } from "../middleware/verified.middleware";

@controller("/user")
export class UserController {
  private readonly service: IUserService;

  constructor(@inject(INTERFACE_TYPE.UserService) service: IUserService) {
    this.service = service;
  }

  @httpPost(
    "/create-account",
    ValidateMiddleware.prototype.validateData(createAccountSchema),
  )
  public async createAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> {
    try {
      const response = await this.service.onCreateAccount(req.body);
      res.cookie("access_token", response.body.data?.access_token, {
        httpOnly: true,
        maxAge: 15 * 60 * 10000,
      });
      res.cookie("refresh_token", response.body.data?.refresh_token, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpPatch(
    "/verify-otp",
    ValidateMiddleware.prototype.validateData(verifyOTPSchema),
    RouteProtectionMiddleware.prototype.privateRoute.bind(
      new RouteProtectionMiddleware(),
    ),
  )
  public async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onVerifyOTP({
        number: req.user?.number as string,
        otp: req.body.otp.toString(),
      });

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpPatch(
    "/setup",
    new Multer().upload.single("avatar"),
    ValidateMiddleware.prototype.validateData(setupUserSchema),
    RouteProtectionMiddleware.prototype.privateRoute.bind(
      new RouteProtectionMiddleware(),
    ),
    VerifiedUser.prototype.checkVerifiedUser.bind(new VerifiedUser()),
  )
  public async setupUser(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onSetupUser({
        phone_no: req.user?.number as string,
        image: req.file || null,
        username: req.body.username,
      });
      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }
}
