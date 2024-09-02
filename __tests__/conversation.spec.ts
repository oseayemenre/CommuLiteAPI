/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { Application } from "../application";
import supertest from "supertest";
import { ConversationRepository } from "../repository/conversation.repository";
import http from "http";
import { UserRepository } from "../repository/user.repository";
import { JWT } from "../utils/jwt";

let app: http.Server;
const refresh_token = new JWT().createToken({
  user: {
    number: "111111",
  },
  secret: "refresh-secret",
  expire: "1y",
});

beforeAll(() => {
  app = new Application().getServer();
});

describe("GET /conversation", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).get("/conversation");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .get("/conversation")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .get("/conversation")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 200 and get all conversations", async () => {
    const conversations = [
      {
        id: 1,
      },
      { id: 2 },
    ];

    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindConversations = jest
      .spyOn(ConversationRepository.prototype, "findConversations")
      .mockResolvedValueOnce(conversations as any);

    const response = await supertest(app)
      .get("/conversation")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindConversations).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe(`${conversations.length} conversations`);
    expect(response.body.data).toEqual(conversations);
  });
});

describe("GET /conversation/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).get("/conversation/123");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .get("/conversation/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .get("/conversation/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 200 and get conversation", async () => {
    const conversation = { id: 1 };

    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindConversation = jest
      .spyOn(ConversationRepository.prototype, "findConversation")
      .mockResolvedValueOnce(conversation as any);

    const response = await supertest(app)
      .get("/conversation/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindConversation).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Conversation found");
    expect(response.body.data).toEqual(conversation);
  });
});

describe("DELETE /conversation/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).delete("/conversation/123");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .delete("/conversation/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .delete("/conversation/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 200 and delete the conversation", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockDeleteConversation = jest
      .spyOn(ConversationRepository.prototype, "deleteConversation")
      .mockResolvedValueOnce(null as any);
    const response = await supertest(app)
      .delete("/conversation/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockDeleteConversation).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Conversation deleted");
  });
});
