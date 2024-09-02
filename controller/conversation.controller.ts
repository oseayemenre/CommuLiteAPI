import { Request, Response, NextFunction } from "express";
import { inject } from "inversify";
import { controller, httpDelete, httpGet } from "inversify-express-utils";
import { INTERFACE_TYPE } from "../utils/dependency";
import { RouteProtectionMiddleware } from "../middleware/route-protection.middleware";
import { VerifiedUser } from "../middleware/verified.middleware";
import { IConversationService } from "../interface/conversation.interface";

@controller(
  "/conversation",
  RouteProtectionMiddleware.prototype.privateRoute.bind(
    new RouteProtectionMiddleware(),
  ),
  VerifiedUser.prototype.checkVerifiedUser.bind(new VerifiedUser()),
)
export class ConversationController {
  private readonly service: IConversationService;

  constructor(
    @inject(INTERFACE_TYPE.ConversationService) service: IConversationService,
  ) {
    this.service = service;
  }

  @httpGet("/")
  public async getConversations(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await this.service.onGetConversations(
        req.user?.number as string,
      );

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpGet("/:id")
  public async getConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await this.service.onGetConversation(req.params.id);

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpDelete("/:id")
  public async deleteConverstation(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await this.service.onDeleteConversation({
        userNumber: req.user?.number as string,
        conversationId: req.params.id,
      });

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }
}
