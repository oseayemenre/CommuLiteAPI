import { PrismaClient, User } from "@prisma/client";
import {
  IAddOtpParam,
  ISetupUserParam,
  IUserRepository,
  TUser,
} from "../interface/user.interface";
import { injectable } from "inversify";

@injectable()
export class UserRepository implements IUserRepository {
  private readonly db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  public async findUserByPhoneNo(phone_no: string): Promise<TUser | null> {
    return (await this.db.user.findUnique({
      where: {
        phone_no: phone_no,
      },

      include: {
        otp: true,
      },
    })) as TUser;
  }
  public async createUser(phone_no: string): Promise<User> {
    return await this.db.user.create({
      data: {
        phone_no: phone_no,
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

  public async verifyUser(id: string): Promise<void> {
    await this.db.user.update({
      where: {
        id: id,
      },

      data: {
        verified: true,
      },
    });
  }

  public async setUpUser(data: ISetupUserParam): Promise<User> {
    const user = await this.db.user.update({
      where: {
        phone_no: data.phone_no,
      },

      data: {
        profile_photo: data.image,
        name: data.username,
      },
    });

    return user;
  }
}
