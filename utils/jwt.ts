import jwt from "jsonwebtoken";
import {
  ICreateTokenParam,
  IDecodeTokenParam,
  IDecodeTokenReturn,
  IJWT,
} from "../interface/jwt.interface";
import { injectable } from "inversify";

@injectable()
export class JWT implements IJWT {
  public createToken(data: ICreateTokenParam): string {
    return jwt.sign(data.user, data.secret, {
      expiresIn: data.expire,
    });
  }

  public decodeToken(data: IDecodeTokenParam): IDecodeTokenReturn {
    return jwt.verify(data.token, data.secret) as IDecodeTokenReturn;
  }
}
