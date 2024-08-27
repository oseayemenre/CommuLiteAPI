import bcrypt from "bcrypt";
import { IBcrypt } from "../interface/bcrypt.interface";
import { injectable } from "inversify";

@injectable()
export class Bcrypt implements IBcrypt {
  public async hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, 12);
  }
}
