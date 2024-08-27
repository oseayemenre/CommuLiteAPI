import { Request, Response, NextFunction } from "express";
import { Schema } from "zod";

export class ValidateMiddleware {
  public validateData(schema: Schema) {
    return function (req: Request, res: Response, next: NextFunction) {
      const validate = schema.safeParse(req.body);
      if (!validate.success) {
        return res.status(400).json({
          status: "failed",
          message: "Bad request",
        });
      }

      return next();
    };
  }
}
