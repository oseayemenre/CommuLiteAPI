/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { Application } from "../application";
import supertest from "supertest";
import { MessageRepository } from "../repository/message.repository";
import http from "http";
import { JWT } from "../utils/jwt";
import { UserRepository } from "../repository/user.repository";

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

describe("POST /message", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app)
      .post("/message")
      .send({ message: "Hi" });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .post("/message")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .post("/message")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 400 if data could not be validated", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const response = await supertest(app)
      .post("/message")
      .send({ message: 1 })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 200 and send the message", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockSendMessage = jest
      .spyOn(MessageRepository.prototype, "sendMessage")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .post("/message")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockSendMessage).toHaveBeenCalled();
    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Message Sent");
  });
});

describe("PATCH /message/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app)
      .patch("/message/123")
      .send({ message: "Hi" });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .patch("/message/123")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .patch("/message/123")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 400 if data could not be validated", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const response = await supertest(app)
      .patch("/message/123")
      .send({ message: 1 })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 400 if 15 minutes has exceeded", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockUserTime = jest
      .spyOn(MessageRepository.prototype, "findMessage")
      .mockResolvedValueOnce({
        createdAt: new Date(Date.now() + 16 * 60 * 1000),
      } as any);

    const response = await supertest(app)
      .patch("/message/123")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockUserTime).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Message cannot be edited");
  });

  it("should return 200 and edit the message if 15 minutes has not exceeded", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockUserTime = jest
      .spyOn(MessageRepository.prototype, "findMessage")
      .mockResolvedValueOnce({
        createdAt: new Date(Date.now() + 10 * 60 * 1000),
      } as any);

    const mockEditMessage = jest
      .spyOn(MessageRepository.prototype, "editMessage")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .patch("/message/123")
      .send({ message: "Hi" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockUserTime).toHaveBeenCalled();
    expect(mockEditMessage).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Message has been updated");
  });
});

describe("DELETE /message/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).delete("/message/123");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .delete("/message/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .delete("/message/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 400 if 15 minutes has exceeded", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockUserTime = jest
      .spyOn(MessageRepository.prototype, "findMessage")
      .mockResolvedValueOnce({
        createdAt: new Date(Date.now() + 16 * 60 * 1000),
      } as any);

    const response = await supertest(app)
      .delete("/message/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockUserTime).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Message cannot be deleted");
  });

  it("should return 200 and delete the message if 15 minutes has not exceeded", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockUserTime = jest
      .spyOn(MessageRepository.prototype, "findMessage")
      .mockResolvedValueOnce({
        createdAt: new Date(Date.now() + 10 * 60 * 1000),
      } as any);

    const mockDeleteMessage = jest
      .spyOn(MessageRepository.prototype, "deleteMessage")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .delete("/message/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockUserTime).toHaveBeenCalled();
    expect(mockDeleteMessage).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Message deleted");
  });
});

describe("DELETE /message/self/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).delete("/message/self/123");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .delete("/message/self/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .delete("/message/self/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 200 and delete message for only the user", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindById = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockDeleteMessage = jest
      .spyOn(MessageRepository.prototype, "deleteMessageForSelf")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .delete("/message/self/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindById).toHaveBeenCalled();
    expect(mockDeleteMessage).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Message deleted");
  });
});
