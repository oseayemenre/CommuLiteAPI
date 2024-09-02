import { User } from "@prisma/client";
import { IResponse } from "./response.interface";

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

export interface IOnSetupUserParam {
  phone_no: string;
  image: Express.Multer.File | null;
  username: string;
}

export interface IOnSetupUserResponse {
  username: string;
  phone_no: string;
  profile_photo: string;
}

export interface IUserService {
  onCreateAccount(data: IOnCreateAccountParam): Promise<IResponse<ITokens>>;
  onVerifyOTP(data: IOnVerifyOtpParam): Promise<IResponse<null>>;
  onSetupUser(
    data: IOnSetupUserParam,
  ): Promise<IResponse<IOnSetupUserResponse>>;
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

export interface ISetupUserParam {
  phone_no: string;
  image: string;
  username: string;
}

export interface IUserRepository {
  findUserByPhoneNo(phone_no: string): Promise<TUser | null>;
  createUser(phone_no: string): Promise<User>;
  addOtp(data: IAddOtpParam): Promise<void>;
  verifyUser(id: string): Promise<void>;
  setUpUser(data: ISetupUserParam): Promise<User>;
}
