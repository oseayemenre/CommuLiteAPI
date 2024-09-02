import { inject, injectable } from "inversify";
import {
  IMessageRepository,
  IMessageService,
  IOnDeleteMessageForSelf,
  IOnEditParams,
  IOnSendMessageParams,
} from "../interface/message.interface";
import { INTERFACE_TYPE } from "../utils/dependency";
import { IResponse } from "../interface/response.interface";
import { IUserRepository } from "../interface/user.interface";

@injectable()
export class MessageService implements IMessageService {
  private readonly repository: IMessageRepository;
  private readonly userRepository: IUserRepository;

  constructor(
    @inject(INTERFACE_TYPE.MessageRepository) repository: IMessageRepository,
    @inject(INTERFACE_TYPE.UserRepository) userRepository: IUserRepository,
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
  }

  public async onSendMessage(
    data: IOnSendMessageParams,
  ): Promise<IResponse<null>> {
    await this.repository.sendMessage(data);
    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "Message Sent",
      },
    };
  }

  public async onEditMessage(data: IOnEditParams): Promise<IResponse<null>> {
    const message = await this.repository.findMessage(data.id);

    if (Math.abs(Date.now() - message.createdAt.getTime()) >= 15 * 60 * 1000) {
      return {
        statusCode: 400,
        body: {
          status: "failed",
          message: "Message cannot be edited",
        },
      };
    }

    await this.repository.editMessage(data);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "Message has been updated",
      },
    };
  }

  public async onDeleteMessage(id: string): Promise<IResponse<null>> {
    const message = await this.repository.findMessage(id);

    if (Math.abs(Date.now() - message.createdAt.getTime()) >= 15 * 60 * 1000) {
      return {
        statusCode: 400,
        body: {
          status: "failed",
          message: "Message cannot be deleted",
        },
      };
    }

    await this.repository.deleteMessage(id);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "Message deleted",
      },
    };
  }

  public async onDeleteMessageForSelf(
    data: IOnDeleteMessageForSelf,
  ): Promise<IResponse<null>> {
    const user = await this.userRepository.findUserByPhoneNo(data.userNumber);

    await this.repository.deleteMessageForSelf({
      userId: user?.id as string,
      messageId: data.messageId,
    });

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "Message deleted",
      },
    };
  }
}
