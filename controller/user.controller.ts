import { NextFunction, Request, Response } from "express";
import { controller, httpPost } from "inversify-express-utils";
import { IUserService } from "../interface/user.interface";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { createAccountSchema } from "../schema/user.schema";
import { inject } from "inversify";
import { INTERFACE_TYPE } from "../utils/dependency";

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

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }
}
