import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import { Server } from "socket.io";
import { WebSocket } from "./utils/socket";
import "./controller/user.controller";
import "./controller/message.controller";
import "./controller/conversation.controller";
import { IUserRepository, IUserService } from "./interface/user.interface";
import { INTERFACE_TYPE } from "./utils/dependency";
import { UserService } from "./service/user.service";
import { UserRepository } from "./repository/user.repository";
import { IBcrypt } from "./interface/bcrypt.interface";
import { Bcrypt } from "./utils/bcrypt";
import { ICommunicationService } from "./interface/communication-service.interface";
import { TextBelt } from "./utils/text-belt";
import { IJWT } from "./interface/jwt.interface";
import { JWT } from "./utils/jwt";
import { IS3 } from "./interface/s3.interface";
import { S3 } from "./utils/s3";
import {
  IMessageRepository,
  IMessageService,
} from "./interface/message.interface";
import { MessageService } from "./service/message.service";
import { MessageRepository } from "./repository/message.repository";
import {
  IConversationRepository,
  IConversationService,
} from "./interface/conversation.interface";
import { ConversationService } from "./service/conversation.service";
import { ConversationRepository } from "./repository/conversation.repository";
import { ClientToServer, ServerToClient } from "./interface/socket.interface";

export class Application {
  private readonly container: Container;
  private readonly inversify_server: InversifyExpressServer;
  private http_server?: http.Server;
  private app?: express.Application;

  constructor() {
    this.container = new Container();
    this.inversify_server = new InversifyExpressServer(this.container);
  }

  private configureContainer(): void {
    this.container
      .bind<IUserService>(INTERFACE_TYPE.UserService)
      .to(UserService);
    this.container
      .bind<IUserRepository>(INTERFACE_TYPE.UserRepository)
      .to(UserRepository);
    this.container.bind<IBcrypt>(INTERFACE_TYPE.Bcrypt).to(Bcrypt);
    this.container
      .bind<ICommunicationService>(INTERFACE_TYPE.CommunicationService)
      .to(TextBelt);
    this.container.bind<IJWT>(INTERFACE_TYPE.Jwt).to(JWT);
    this.container.bind<IS3>(INTERFACE_TYPE.S3).to(S3);
    this.container
      .bind<IMessageService>(INTERFACE_TYPE.MessageService)
      .to(MessageService);
    this.container
      .bind<IMessageRepository>(INTERFACE_TYPE.MessageRepository)
      .to(MessageRepository);
    this.container
      .bind<IConversationService>(INTERFACE_TYPE.ConversationService)
      .to(ConversationService);
    this.container
      .bind<IConversationRepository>(INTERFACE_TYPE.ConversationRepository)
      .to(ConversationRepository);
  }

  private configureMiddleWare(): void {
    this.inversify_server.setConfig((app) => {
      app.use(express.json());
      app.use(
        express.urlencoded({
          extended: true,
        }),
      );
      app.use(helmet());
      app.use(cors());
      app.use(morgan("dev"));
      app.use(cookieParser());
    });
  }

  private configureSocketServer(): void {
    if (!(this.http_server && this.app)) {
      this.app = this.inversify_server.build();
      this.http_server = http.createServer(this.app);

      const io = new Server<ClientToServer, ServerToClient>(this.http_server);

      new WebSocket().socketEvents(io);
    }
  }

  public getServer(): http.Server {
    this.configureMiddleWare();
    this.configureContainer();
    this.configureSocketServer();

    if (this.http_server && this.app) {
      this.app.get("/", (_, res: Response) => {
        return res.status(200).json({
          status: "success",
          message: "Mini whatsapp api",
        });
      });

      this.app.get("*", (_, res: Response) => {
        return res.status(404).json({
          status: "failed",
          message: "Route not found",
        });
      });

      this.app.use(
        (error: Error, req: Request, res: Response, next: NextFunction) => {
          error.message = error.message || "Internal server error";

          res.status(500).json({
            status: "failed",
            message: error.message,
            stackTrace:
              process.env.NODE_ENV !== "production" ? error.stack : null,
          });

          return next();
        },
      );
    }

    return this.http_server as http.Server;
  }
}
