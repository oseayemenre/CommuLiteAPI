import { Conversation } from "@prisma/client";
import { IResponse } from "./response.interface";

export interface IOnDeleteConversationParams {
  userNumber: string;
  conversationId: string;
}

export interface IConversationService {
  onGetConversations(number: string): Promise<IResponse<Conversation[]>>;
  onGetConversation(id: string): Promise<IResponse<Conversation>>;
  onDeleteConversation(
    data: IOnDeleteConversationParams,
  ): Promise<IResponse<null>>;
}

export interface IConversationRepository {
  findConversations(number: string): Promise<Conversation[]>;
  findConversation(id: string): Promise<Conversation>;
  deleteConversation(data: IOnDeleteConversationParams): Promise<void>;
}
