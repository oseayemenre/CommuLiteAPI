import { Conversation, PrismaClient } from "@prisma/client";
import {
  IConversationRepository,
  IOnDeleteConversationParams,
} from "../interface/conversation.interface";
import { injectable } from "inversify";

@injectable()
export class ConversationRepository implements IConversationRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  public async findConversations(number: string): Promise<Conversation[]> {
    const user = await this.db.user.findUnique({ where: { phone_no: number } });

    return await this.db.conversation.findMany({
      where: {
        users: {
          some: {
            userId: user?.id,
          },
        },
      },
      include: {
        messages: {
          include: {
            sender: true,
            reciever: true,
          },
        },
      },
    });
  }

  public async findConversation(id: string): Promise<Conversation> {
    return (await this.db.conversation.findUnique({
      where: {
        id: id,
      },
    })) as Conversation;
  }

  public async deleteConversation(
    data: IOnDeleteConversationParams,
  ): Promise<void> {
    const user = await this.db.user.findUnique({
      where: { phone_no: data.userNumber },
    });
    await this.db.conversation.deleteMany({
      where: {
        id: data.conversationId,
        users: {
          some: {
            userId: user?.id,
          },
        },
      },
    });
  }
}
