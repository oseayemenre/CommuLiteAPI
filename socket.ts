import { Server } from "socket.io";

export class WebSocket {
  public async socketEvents(io: Server) {
    io.on("connection", (socket) => {
      console.log(`${socket.id} has connected`);

      socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
      });
    });
  }
}
