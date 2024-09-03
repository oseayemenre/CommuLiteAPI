import { Request, Response, NextFunction } from "express";
import { inject } from "inversify";
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from "inversify-express-utils";
import { INTERFACE_TYPE } from "../utils/dependency";
import { RouteProtectionMiddleware } from "../middleware/route-protection.middleware";
import { VerifiedUser } from "../middleware/verified.middleware";
import { IConversationService } from "../interface/conversation.interface";
import { Multer } from "../utils/multer";
import { ValidateMiddleware } from "../middleware/validate.middleware";
import {
  createGroupChatSchema,
  setGroupAdminSchema,
  setGroupStatusSchema,
} from "../schema/conversation";
import { RoleMiddleware } from "../middleware/role.middleware";

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

  @httpPost(
    "/group",
    new Multer().upload.single("gc-picture"),
    ValidateMiddleware.prototype.validateData(createGroupChatSchema),
  )
  public async createGroupChat(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const response = await this.service.onCreateGroupChat({
        ...req.body,
        image: req.file || null,
        adminPhoneNo: req.user?.number as string,
      });
      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpPatch(
    "/group/:id",
    RoleMiddleware.prototype.isAdmin.bind(new RoleMiddleware()),
    ValidateMiddleware.prototype.validateData(setGroupAdminSchema),
  )
  public async setGroupAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onSetGroupAdmin({
        ...req.body,
        userId: req.user?.number as string,
        groupId: req.params.id,
      });
      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpPatch(
    "/group/status/:id",
    RoleMiddleware.prototype.isAdmin.bind(new RoleMiddleware()),
    ValidateMiddleware.prototype.validateData(setGroupStatusSchema),
  )
  public async setGroupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onSetGroupStatus({
        groupId: req.params.id,
        status: req.body.status,
      });

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }

  @httpPatch("/group/add/:id")
  public async JoinGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.service.onJoinGroup({
        userId: req.user?.number as string,
        groupId: req.params.id,
      });

      return res.status(response.statusCode).json(response.body);
    } catch (e) {
      next(e);
    }
  }
}
