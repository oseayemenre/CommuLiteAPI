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

export interface IOnVerifyOtpParam {
  number: string;
  otp: number;
}

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

export interface IUserService {
  onCreateAccount(data: IOnCreateAccountParam): Promise<IResponse<ITokens>>;
  onVerifyOTP(data: IOnVerifyOtpParam): Promise<IResponse<void>>;
}

export interface IAddOtpParam {
  user: string;
  otp: string;
}

export type TUser = User & {
  otp: {
    otp: string;
  };
};

export interface IUserRepository {
  findUserByPhoneNo(phone_no: string): Promise<TUser | null>;
  createUser(phone_no: string): Promise<User>;
  addOtp(data: IAddOtpParam): Promise<void>;
  verifyUser(id: string): Promise<void>;
}
