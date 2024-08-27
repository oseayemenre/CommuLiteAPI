/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import supertest from "supertest";
import { Application } from "../application";
import http from "http";
import { UserRepository } from "../repository/user.repository";
import { TextBelt } from "../utils/text-belt";

let app: http.Server;

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
      .spyOn(UserRepository.prototype, "findUser")
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
      .spyOn(UserRepository.prototype, "findUser")
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
      .mockReturnValueOnce(null as any);

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
