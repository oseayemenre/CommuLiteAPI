import "reflect-metadata";
import supertest from "supertest";
import { Application } from "../application";
import http from "http";

let app: http.Server;

beforeAll(() => {
  app = new Application().getServer();
});

describe("GET /test", () => {
  it("should return 200", async () => {
    const response = await supertest(app).get("/test");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("Test route reached");
  });
});
