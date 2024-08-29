import bcrypt from "bcrypt";
import { IBcrypt, ICompareParam } from "../interface/bcrypt.interface";
import { injectable } from "inversify";

@injectable()
export class Bcrypt implements IBcrypt {
  public async hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, 12);
  }

  public async compare(data: ICompareParam): Promise<boolean> {
    return await bcrypt.compare(data.inputOTP, data.userOTP);
  }
}
