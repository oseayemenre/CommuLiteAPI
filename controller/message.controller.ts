import { Request, Response, NextFunction } from "express";
import { inject } from "inversify";
import { INTERFACE_TYPE } from "../utils/dependency";
import {
  controller,
  httpDelete,
  httpPatch,
  httpPost,
} from "inversify-express-utils";
import { IMessageService } from "../interface/message.interface";
import { RouteProtectionMiddleware } from "../middleware/route-protection.middleware";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import { VerifiedUser } from "../middleware/verified.middleware";
import { sendMessageSchema } from "../schema/message.schema";

@controller(
  "/message",
  RouteProtectionMiddleware.prototype.privateRoute.bind(
    new RouteProtectionMiddleware(),
  ),
  VerifiedUser.prototype.checkVerifiedUser.bind(new VerifiedUser()),
)
export class MessageController {
  private readonly service: IMessageService;

  constructor(@inject(INTERFACE_TYPE.MessageService) service: IMessageService) {
    this.service = service;
  }

  @httpPost("/", ValidateMiddleware.prototype.validateData(sendMessageSchema))
  public async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onSendMessage({
        senderId: req.user?.number as string,
        recieverId: req.params.id,
        message: req.body.message,
      });

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpPatch(
    "/:id",
    ValidateMiddleware.prototype.validateData(sendMessageSchema),
  )
  public async editMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onEditMessage({
        id: req.params.id,
        message: req.body.message,
      });
      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpDelete("/:id")
  public async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onDeleteMessage(req.params.id);

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpDelete("/self/:id")
  public async deleteMessageForSelf(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await this.service.onDeleteMessageForSelf({
        userNumber: req.user?.number as string,
        messageId: req.params.id,
      });

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }
}
