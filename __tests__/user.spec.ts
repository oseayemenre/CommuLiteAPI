/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import supertest from "supertest";
import { Application } from "../application";
import http from "http";
import { UserRepository } from "../repository/user.repository";
import { TextBelt } from "../utils/text-belt";
import { JWT } from "../utils/jwt";
import { Bcrypt } from "../utils/bcrypt";
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

describe("POST /user/create-account", () => {
  it("should return 400 if data could not be validated", async () => {
    const response = await supertest(app)
      .post("/user/create-account")
      .send({ phone_no: 1 });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 409 if the user already exists", async () => {
    const mockFindUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ user: true } as any);

    const response = await supertest(app)
      .post("/user/create-account")
      .send({ phone_no: "11111111111" });

    expect(mockFindUser).toHaveBeenCalled();
    expect(response.status).toBe(409);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("User already exists");
  });

  it("should return 200 and send the otp", async () => {
    const mockFindUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce(null);

    const mockCreateUser = jest
      .spyOn(UserRepository.prototype, "createUser")
      .mockResolvedValueOnce({
        id: "123",
      } as any);

    const mockAddOtp = jest
      .spyOn(UserRepository.prototype, "addOtp")
      .mockResolvedValueOnce(null as any);

    const mockSendMail = jest
      .spyOn(TextBelt.prototype, "sendEmail")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .post("/user/create-account")
      .send({ phone_no: "11111111111" });

    expect(mockFindUser).toHaveBeenCalled();
    expect(mockCreateUser).toHaveBeenCalled();
    expect(mockAddOtp).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("An otp has been sent to your email");
  });
});

describe("PATCH /user/verify-otp", () => {
  it("should return 400 if data could not be validated", async () => {
    const response = await supertest(app)
      .patch("/user/verify-otp")
      .send({ otp: "1" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 401 if no token is found", async () => {
    const response = await supertest(app)
      .patch("/user/verify-otp")
      .send({ otp: 111111 });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .patch("/user/verify-otp")
      .send({ otp: 111111 })
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 409 if user is already verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const response = await supertest(app)
      .patch("/user/verify-otp")
      .send({ otp: 111111 })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(409);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("User is already verified");
  });

  it("should return 401 if otp does not match", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({
        verified: false,
        otp: {
          otp: new Bcrypt().hashData("111111"),
        },
      } as any);

    const mockCompareData = jest
      .spyOn(Bcrypt.prototype, "compare")
      .mockResolvedValueOnce(false);

    const response = await supertest(app)
      .patch("/user/verify-otp")
      .send({ otp: 111112 })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockCompareData).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Invalid OTP");
  });

  it("should return 200 and verify the user", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({
        verified: false,
        otp: {
          otp: new Bcrypt().hashData("111111"),
        },
      } as any);

    const mockCompareData = jest
      .spyOn(Bcrypt.prototype, "compare")
      .mockResolvedValueOnce(true);

    const mockVerifyUser = jest
      .spyOn(UserRepository.prototype, "verifyUser")
      .mockResolvedValueOnce(null as any);

    const response = await supertest(app)
      .patch("/user/verify-otp")
      .send({ otp: 111112 })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockCompareData).toHaveBeenCalled();
    expect(mockVerifyUser).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User verified");
  });
});

describe("PATH /user/setup", () => {
  it("should return 400 if data could not be validated", async () => {
    const response = await supertest(app)
      .patch("/user/setup")
      .send({ username: 1 });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Bad request");
  });

  it("should return 401 if no token is found", async () => {
    const response = await supertest(app)
      .patch("/user/setup")
      .send({ username: "user1" });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe("Login to access this route");
  });

  it("should return 500 if the token has been altered", async () => {
    const response = await supertest(app)
      .patch("/user/setup")
      .send({ username: "user1" })
      .set("Cookie", [`refresh_token=altered-token`]);

    expect(response.status).toBe(500);
  });

  it("should return 401 if user is not verified", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: false } as any);

    const response = await supertest(app)
      .patch("/user/setup")
      .send({ username: "user1" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("failed");
    expect(response.body.message).toBe(
      "User is not verifiied. Verify your account first before you can continue using our service",
    );
  });

  it("should return 200 and setup the user", async () => {
    const mockCheckVerifiedUser = jest
      .spyOn(UserRepository.prototype, "findUserByPhoneNo")
      .mockResolvedValueOnce({ verified: true } as any);

    const mockAWSS3 = jest
      .spyOn(S3.prototype, "uploadFile")
      .mockResolvedValueOnce("image url");

    const mockSetUpUser = jest
      .spyOn(UserRepository.prototype, "setUpUser")
      .mockResolvedValueOnce({
        name: "user1",
        phone_no: "11111111111",
        profile_photo: "profile photo",
      } as any);

    const response = await supertest(app)
      .patch("/user/setup")
      .send({ username: "user1" })
      .set("Cookie", [`refresh_token=${refresh_token}`]);

    expect(mockCheckVerifiedUser).toHaveBeenCalled();
    expect(mockAWSS3).toHaveBeenCalled();
    expect(mockSetUpUser).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("User profile set");
    expect(response.body.data.username).toBe("user1");
    expect(response.body.data.phone_no).toBe("11111111111");
    expect(response.body.data.profile_photo).toBe("profile photo");
  });
});
