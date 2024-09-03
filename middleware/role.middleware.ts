import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repository/user.repository";
import { IConversationRepository } from "../interface/conversation.interface";
import { ConversationRepository } from "../repository/conversation.repository";
import { Role } from "@prisma/client";

export class RoleMiddleware {
  private readonly db: UserRepository;
  private readonly conversationDB: IConversationRepository;

  constructor() {
    this.db = new UserRepository();
    this.conversationDB = new ConversationRepository();
  }

  public async isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.db.findUserByPhoneNo(req.user?.number as string);

      const userRole = await this.conversationDB.findUserRole({
        groupId: req.params.id,
        member: user?.id as string,
      });

      if (userRole !== Role.ADMIN) {
        return res.status(401).json({
          status: "failed",
          message: "User is not authorized to set admins",
        });
      }

      next();
    } catch (e) {
      next(e);
    }
  }
}
