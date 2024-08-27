import { PrismaClient, User } from "@prisma/client";
import { IAddOtpParam, IUserRepository } from "../interface/user.interface";
import { injectable } from "inversify";

@injectable()
export class UserRepository implements IUserRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  public async findUser(phone_no: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: {
        phone_no: parseInt(phone_no),
      },
    });
  }
  public async createUser(phone_no: string): Promise<User> {
    return await this.db.user.create({
      data: {
        phone_no: parseInt(phone_no),
      },
    });
  }
  public async addOtp(data: IAddOtpParam): Promise<void> {
    await this.db.oTP.create({
      data: {
        otp: data.otp,
        user: {
          connect: {
            id: data.user,
          },
        },
      },
    });
  }
}
