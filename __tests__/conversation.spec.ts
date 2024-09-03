/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { Application } from "../application";
import supertest from "supertest";
import { ConversationRepository } from "../repository/conversation.repository";
import http from "http";
import { UserRepository } from "../repository/user.repository";
import { JWT } from "../utils/jwt";
import { S3 } from "../utils/s3";

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

describe("POST /conversation/group", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).post("/conversation/group");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .post("/conversation/group")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .post("/conversation/group")
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
      .post("/conversation/group")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 200 and create the group chat", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockS3Upload = jest
      .spyOn(S3.prototype, "uploadFile")
      .mockResolvedValueOnce("upload");

    const mockCreateGroupChat = jest
      .spyOn(ConversationRepository.prototype, "createGroupChat")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .post("/conversation/group")
      .send({
        name: "Test group",
        description: "test description",
        members: ["member 1", "member 2"],
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockS3Upload).toHaveBeenCalled();
    expect(mockCreateGroupChat).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Test group created");
  });
});

describe("PATCH /group/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).patch("/conversation/group/123");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .patch("/conversation/group/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .patch("/conversation/group/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 401 if user is not an admin", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("PARTICIPANT");

    const response = await supertest(app)
      .patch("/conversation/group/123")
      .send({
        member: "member 1",
        role: "PARTICIPANTS",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("User is not authorized to set admins");
  });

  it("should return 400 if data could not be validated", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("ADMIN");

    const response = await supertest(app)
      .patch("/conversation/group/123")
      .send({
        member: "member 1",
        role: "PARTICIPANTS",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 400 if member is already an admin", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("ADMIN");

    const mockCheckMemberRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("ADMIN");

    const response = await supertest(app)
      .patch("/conversation/group/123")
      .send({
        member: "member 1",
        role: "PARTICIPANT",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(mockCheckMemberRole).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("User is already an admin");
  });

  it("should return 200 and set the member as admin", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("ADMIN");

    const mockCheckMemberRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("PARTICIPANT");

    const mockSetGroupAdmin = jest
      .spyOn(ConversationRepository.prototype, "setGroupAdmin")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .patch("/conversation/group/123")
      .send({
        member: "member 1",
        role: "PARTICIPANT",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(mockCheckMemberRole).toHaveBeenCalled();
    expect(mockSetGroupAdmin).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User has been set as group admin");
  });
});

describe("PATCH /conversation/group/status/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).patch(
      "/conversation/group/status/123",
    );

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .patch("/conversation/group/status/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .patch("/conversation/group/status/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 401 if user is not an admin", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("PARTICIPANT");

    const response = await supertest(app)
      .patch("/conversation/group/status/123")
      .send({
        status: "LOCKED",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("User is not authorized to set admins");
  });

  it("should return 400 if data could not be validated", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("ADMIN");

    const response = await supertest(app)
      .patch("/conversation/group/status/123")
      .send({
        status: "LOCK",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 200 and set the group status", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockFindUserByNo = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ id: 1 } as any);

    const mockCheckUserRole = jest
      .spyOn(ConversationRepository.prototype, "findUserRole")
      .mockResolvedValueOnce("ADMIN");

    const mockSetGroupStatus = jest
      .spyOn(ConversationRepository.prototype, "setGroupStatus")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .patch("/conversation/group/status/123")
      .send({
        status: "LOCKED",
      })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockFindUserByNo).toHaveBeenCalled();
    expect(mockCheckUserRole).toHaveBeenCalled();
    expect(mockSetGroupStatus).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Group is LOCKED");
  });
});

describe("PATCH /conversation/group/add/:id", () => {
  it("should return 401 if no token is found", async () => {
    const response = await supertest(app).patch("/conversation/group/add/123");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .patch("/conversation/group/add/123")
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .patch("/conversation/group/add/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 200 and add the user to the group", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockJoinGroup = jest
      .spyOn(ConversationRepository.prototype, "joinGroup")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .patch("/conversation/group/add/123")
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockJoinGroup).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User has joined group");
  });
});
