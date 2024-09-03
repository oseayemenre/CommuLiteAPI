import { Conversation, Message, PrismaClient } from "@prisma/client";
import {
  IDeleteMessageForSelf,
  IMessageRepository,
  IOnEditParams,
  IOnSendMessageParams,
  IOnSendMessageToGroup,
} from "../interface/message.interface";
import { injectable } from "inversify";

@injectable()
export class MessageRepository implements IMessageRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  public async sendMessage(data: IOnSendMessageParams): Promise<void> {
    const sender = await this.db.user.findUnique({
      where: { phone_no: data.senderId },
    });
    let conversation = await this.db.conversation.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                userId: sender?.id,
              },
            },
          },

          {
            users: {
              some: {
                userId: data.recieverId,
              },
            },
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await this.db.conversation.create({
        data: {
          users: {
            create: [
              { userId: sender?.id as string },
              { userId: data.recieverId },
            ],
          },
        },
      });
    }

    await this.db.message.create({
      data: {
        message: data.message,
        conversation: {
          connect: {
            id: conversation.id,
          },
        },
        sender: {
          connect: {
            id: sender?.id,
          },
        },
        reciever: {
          connect: {
            id: data.recieverId,
          },
        },
      },
    });
  }

  public async findMessage(id: string): Promise<Message> {
    return (await this.db.message.findUnique({
      where: {
        id: id,
      },
    })) as Message;
  }

  public async editMessage(data: IOnEditParams): Promise<void> {
    await this.db.message.update({
      where: {
        id: data.id,
      },

      data: {
        message: data.message,
      },
    });
  }

  public async deleteMessage(id: string): Promise<void> {
    await this.db.message.delete({
      where: {
        id: id,
      },
    });
  }

  public async deleteMessageForSelf(
    data: IDeleteMessageForSelf,
  ): Promise<void> {
    const message = await this.db.message.findUnique({
      where: {
        id: data.messageId,
      },
    });

    if (message?.senderId === data.userId) {
      await this.db.message.update({
        where: {
          id: data.messageId,
        },

        data: {
          senderId: null,
        },
      });
    }

    if (message?.recieverId === data.userId) {
      await this.db.message.update({
        where: {
          id: data.messageId,
        },

        data: {
          recieverId: null,
        },
      });
    }
  }

  public async checkIfUserBelongsToGroup(
    data: IOnSendMessageToGroup,
  ): Promise<Conversation | null> {
    return await this.db.conversation.findUnique({
      where: {
        id: data.groupId,
        users: {
          some: {
            id: data.userId,
          },
        },
      },
    });
  }
  public async checkGroupStatus(groupId: string): Promise<Conversation> {
    return (await this.db.conversation.findUnique({
      where: {
        id: groupId,
      },
    })) as Conversation;
  }
  public async sendMessageToGroup(data: IOnSendMessageToGroup): Promise<void> {
    await this.db.message.create({
      data: {
        message: data.message,
        sender: {
          connect: {
            id: data.userId,
          },
        },
        conversation: {
          connect: {
            id: data.groupId,
          },
        },
      },
    });
  }
}
