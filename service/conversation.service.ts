import { Conversation } from "@prisma/client";
import {
  IConversationRepository,
  IConversationService,
  IOnDeleteConversationParams,
} from "../interface/conversation.interface";
import { IResponse } from "../interface/response.interface";
import { inject, injectable } from "inversify";
import { INTERFACE_TYPE } from "../utils/dependency";

@injectable()
export class ConversationService implements IConversationService {
  private readonly repository: IConversationRepository;

  constructor(
    @inject(INTERFACE_TYPE.ConversationRepository)
    repository: IConversationRepository,
  ) {
    this.repository = repository;
  }

  public async onGetConversations(
    number: string,
  ): Promise<IResponse<Conversation[]>> {
    const conversations = await this.repository.findConversations(number);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: `${conversations.length} conversations`,
        data: conversations,
      },
    };
  }

  public async onGetConversation(id: string): Promise<IResponse<Conversation>> {
    const conversation = await this.repository.findConversation(id);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "Conversation found",
        data: conversation,
      },
    };
  }

  public async onDeleteConversation(
    data: IOnDeleteConversationParams,
  ): Promise<IResponse<null>> {
    await this.repository.deleteConversation(data);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "Conversation deleted",
      },
    };
  }
}
