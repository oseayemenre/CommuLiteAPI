import { Conversation, Role } from "@prisma/client";
import {
  IConversationRepository,
  IConversationService,
  IOnCreateGroupChatParams,
  IOnCreateGroupChatResponse,
  IOnDeleteConversationParams,
  IOnJoinGroupParam,
  IOnSetGroupAdmin,
  IOnSetGroupStatus,
} from "../interface/conversation.interface";
import { IResponse } from "../interface/response.interface";
import { inject, injectable } from "inversify";
import { INTERFACE_TYPE } from "../utils/dependency";
import { IS3 } from "../interface/s3.interface";

@injectable()
export class ConversationService implements IConversationService {
  private readonly repository: IConversationRepository;
  private readonly s3: IS3;

  constructor(
    @inject(INTERFACE_TYPE.ConversationRepository)
    repository: IConversationRepository,
    @inject(INTERFACE_TYPE.S3) s3: IS3,
  ) {
    this.repository = repository;
    this.s3 = s3;
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

  public async onCreateGroupChat(
    data: IOnCreateGroupChatParams,
  ): Promise<IResponse<IOnCreateGroupChatResponse>> {
    const gc_picture = await this.s3.uploadFile(data.image);

    await this.repository.createGroupChat({ ...data, image: gc_picture });

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: `${data.name} created`,
        data: {
          name: data.name,
          description: data.description,
          image: gc_picture,
        },
      },
    };
  }

  public async onSetGroupAdmin(
    data: IOnSetGroupAdmin,
  ): Promise<IResponse<null>> {
    const memberRole = await this.repository.findUserRole({
      groupId: data.groupId,
      member: data.member,
    });

    if (memberRole === Role.ADMIN) {
      return {
        statusCode: 400,
        body: {
          status: "failed",
          message: "User is already an admin",
        },
      };
    }

    await this.repository.setGroupAdmin({
      member: data.member,
      groupId: data.groupId,
      role: data.role,
    });

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "User has been set as group admin",
      },
    };
  }

  public async onSetGroupStatus(
    data: IOnSetGroupStatus,
  ): Promise<IResponse<null>> {
    await this.repository.setGroupStatus(data);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: `Group is ${data.status}`,
      },
    };
  }

  public async onJoinGroup(data: IOnJoinGroupParam): Promise<IResponse<null>> {
    await this.repository.joinGroup(data);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "User has joined group",
      },
    };
  }
}
