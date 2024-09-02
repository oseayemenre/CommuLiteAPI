import { Message } from "@prisma/client";
import { IResponse } from "./response.interface";

export interface IOnSendMessageParams {
  senderId: string;
  recieverId: string;
  message: string;
}

export interface IOnEditParams {
  id: string;
  message: string;
}

export interface IOnDeleteMessageForSelf {
  userNumber: string;
  messageId: string;
}

export interface IDeleteMessageForSelf {
  userId: string;
  messageId: string;
}

export interface IMessageService {
  onSendMessage(data: IOnSendMessageParams): Promise<IResponse<null>>;
  onEditMessage(data: IOnEditParams): Promise<IResponse<null>>;
  onDeleteMessage(id: string): Promise<IResponse<null>>;
  onDeleteMessageForSelf(
    data: IOnDeleteMessageForSelf,
  ): Promise<IResponse<null>>;
}

export interface IMessageRepository {
  sendMessage(data: IOnSendMessageParams): Promise<void>;
  findMessage(id: string): Promise<Message>;
  editMessage(data: IOnEditParams): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  deleteMessageForSelf(data: IDeleteMessageForSelf): Promise<void>;
}
