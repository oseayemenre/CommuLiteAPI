import { Server } from "socket.io";
import {
  IOnlineUsers,
  IMessageSocket,
  ClientToServer,
  ServerToClient,
  IDeleteMessageSocket,
} from "../interface/socket.interface";

export class WebSocket {
  private onlineUsers: IOnlineUsers[];

  constructor() {
    this.onlineUsers = [];
  }

  private addUser(username: string, socketId: string) {
    const user = this.onlineUsers.find((user) => (user.username = username));
    return (
      !user && this.onlineUsers.push({ username: username, socketId: socketId })
    );
  }

  private getUser(username: string) {
    return this.onlineUsers.find((user) => (user.username = username));
  }

  private removeUser(socketId: string) {
    return (this.onlineUsers = this.onlineUsers.filter(
      (user) => user.socketId !== socketId,
    ));
  }

  public async socketEvents(io: Server<ClientToServer, ServerToClient>) {
    io.on("connection", (socket) => {
      socket.on("new_user", (username: string) => {
        this.addUser(username, socket.id);
      });

      socket.on("send_message", (data: IMessageSocket) => {
        const reciever = this.getUser(data.recieverName);

        io.to(reciever?.socketId as string).emit("recieve_message", data);
      });

      socket.on("send_edit_message", (data: IMessageSocket) => {
        const reciever = this.getUser(data.recieverName);

        io.to(reciever?.socketId as string).emit(
          "recieve_edited_message",
          data.message,
        );
      });

      socket.on("send_delete_message", (data: IDeleteMessageSocket) => {
        const reciever = this.getUser(data.recieverName);

        io.to(reciever?.socketId as string).emit(
          "recieve_deleted_message",
          data,
        );
      });

      socket.on("disconnect", () => {
        this.removeUser(socket.id);
      });
    });
  }
}
