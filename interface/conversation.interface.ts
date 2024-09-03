import { Conversation, Role, Status } from "@prisma/client";
import { IResponse } from "./response.interface";

export interface IOnDeleteConversationParams {
  userNumber: string;
  conversationId: string;
}

export interface IOnCreateGroupChatParams {
  adminPhoneNo: string;
  name: string;
  description: string;
  members: string[];
  image: Express.Multer.File;
}

export interface IOnCreateGroupChatResponse {
  name: string;
  description: string;
  image: string;
}

export interface IOnSetGroupAdmin {
  userId: string;
  groupId: string;
  member: string;
  role: Role;
}

export interface IOnSetGroupStatus {
  groupId: string;
  status: Status;
}

export interface IOnJoinGroupParam {
  userId: string;
  groupId: string;
}

export interface IConversationService {
  onGetConversations(number: string): Promise<IResponse<Conversation[]>>;
  onGetConversation(id: string): Promise<IResponse<Conversation>>;
  onDeleteConversation(
    data: IOnDeleteConversationParams,
  ): Promise<IResponse<null>>;
  onCreateGroupChat(
    data: IOnCreateGroupChatParams,
  ): Promise<IResponse<IOnCreateGroupChatResponse>>;
  onSetGroupAdmin(data: IOnSetGroupAdmin): Promise<IResponse<null>>;
  onSetGroupStatus(data: IOnSetGroupStatus): Promise<IResponse<null>>;
  onJoinGroup(data: IOnJoinGroupParam): Promise<IResponse<null>>;
}

export type TCreateGroupChat = Omit<IOnCreateGroupChatParams, "image"> & {
  image: string;
};

export interface IConversationRepository {
  findConversations(number: string): Promise<Conversation[]>;
  findConversation(id: string): Promise<Conversation>;
  deleteConversation(data: IOnDeleteConversationParams): Promise<void>;
  createGroupChat(data: TCreateGroupChat): Promise<void>;
  findUserRole(
    data: Omit<IOnSetGroupAdmin, "userId" | "role">,
  ): Promise<string>;
  setGroupAdmin(data: Omit<IOnSetGroupAdmin, "userId">): Promise<void>;
  setGroupStatus(data: IOnSetGroupStatus): Promise<void>;
  joinGroup(data: IOnJoinGroupParam): Promise<void>;
}
