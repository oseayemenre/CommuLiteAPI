import { Conversation, PrismaClient, Role } from "@prisma/client";
import {
  IConversationRepository,
  IOnDeleteConversationParams,
  IOnJoinGroupParam,
  IOnSetGroupAdmin,
  IOnSetGroupStatus,
  TCreateGroupChat,
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

  public async createGroupChat(data: TCreateGroupChat): Promise<void> {
    const user = await this.db.user.findUnique({
      where: {
        phone_no: data.adminPhoneNo,
      },
    });

    await this.db.conversation.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        users: {
          create: [
            {
              userId: user?.id as string,
              role: "ADMIN",
            },

            ...data.members.map(() => ({
              userId: user?.id as string,
              role: "PARTICIPANT" as Role,
            })),
          ],
        },
      },
    });
  }

  public async findUserRole(
    data: Omit<IOnSetGroupAdmin, "userId" | "role">,
  ): Promise<string> {
    const user = await this.db.userConversation.findFirst({
      where: {
        conversationId: data.groupId,
        userId: data.member,
      },
    });

    return user?.role as Role;
  }

  public async setGroupAdmin(
    data: Omit<IOnSetGroupAdmin, "userId">,
  ): Promise<void> {
    const userConversation = await this.db.userConversation.findFirst({
      where: {
        conversationId: data.groupId,
      },
    });

    await this.db.userConversation.update({
      where: {
        id: userConversation?.id,
        userId: data.member,
      },

      data: {
        role: data.role,
      },
    });
  }

  public async setGroupStatus(data: IOnSetGroupStatus): Promise<void> {
    await this.db.conversation.update({
      where: {
        id: data.groupId,
      },

      data: {
        status: data.status,
      },
    });
  }

  public async joinGroup(data: IOnJoinGroupParam): Promise<void> {
    await this.db.conversation.update({
      where: {
        id: data.groupId,
      },

      data: {
        users: {
          create: {
            users: {
              connect: {
                id: data.userId,
              },
            },
          },
        },
      },
    });
  }
}
