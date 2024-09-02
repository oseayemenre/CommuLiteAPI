export interface IOnlineUsers {
  username: string;
  socketId: string;
}

export interface IMessageSocket {
  senderName: string;
  recieverName: string;
  message: string;
}

export interface IDeleteMessageSocket {
  recieverName: string;
  messageId: string;
}

export interface ClientToServer {
  new_user: (username: string) => void;
  send_message: (data: IMessageSocket) => void;
  send_edit_message: (data: IMessageSocket) => void;
  send_delete_message: (data: IDeleteMessageSocket) => void;
}

export interface ServerToClient {
  recieve_message: (data: IMessageSocket) => void;
  recieve_edited_message: (message: string) => void;
  recieve_deleted_message: (data: IDeleteMessageSocket) => void;
}
