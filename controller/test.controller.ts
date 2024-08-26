import { Request, Response } from "express";
import { controller, httpGet } from "inversify-express-utils";

@controller("/test")
export class TestController {
  @httpGet("/")
  public async getTestRoute(req: Request, res: Response) {
    return res.status(200).json({
      status: "success",
      message: "Test route reached",
    });
  }
}
