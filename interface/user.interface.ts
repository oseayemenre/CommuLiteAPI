import { User } from "@prisma/client";

export interface IResponse<T> {
  statusCode: number;
  body: {
    status: "success" | "failed";
    message: string;
    data?: T;
  };
}

export interface IOnCreateAccountParam {
  phone_no: number;
}

export interface IUserService {
  onCreateAccount(data: IOnCreateAccountParam): Promise<IResponse<void>>;
}

export interface IAddOtpParam {
  user: string;
  otp: string;
}

export interface IUserRepository {
  findUser(phone_no: string): Promise<User | null>;
  createUser(phone_no: string): Promise<User>;
  addOtp(data: IAddOtpParam): Promise<void>;
}
