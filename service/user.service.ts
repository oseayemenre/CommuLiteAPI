import { injectable, inject } from "inversify";
import { IBcrypt } from "../interface/bcrypt.interface";
import { ICommunicationService } from "../interface/communication-service.interface";
import {
  IOnCreateAccountParam,
  IOnSetupUserParam,
  IOnSetupUserResponse,
  IOnVerifyOtpParam,
  ITokens,
  IUserRepository,
  IUserService,
} from "../interface/user.interface";
import { INTERFACE_TYPE } from "../utils/dependency";
import { IJWT } from "../interface/jwt.interface";
import dotenv from "dotenv";
import { IS3 } from "../interface/s3.interface";
import { IResponse } from "../interface/response.interface";

dotenv.config();

@injectable()
export class UserService implements IUserService {
  private readonly repository: IUserRepository;
  private readonly communicationService: ICommunicationService;
  private readonly bcrypt: IBcrypt;
  private readonly jwt: IJWT;
  private readonly bucket: IS3;

  constructor(
    @inject(INTERFACE_TYPE.UserRepository) repository: IUserRepository,
    @inject(INTERFACE_TYPE.CommunicationService)
    communicationService: ICommunicationService,
    @inject(INTERFACE_TYPE.Bcrypt) bcrypt: IBcrypt,
    @inject(INTERFACE_TYPE.Jwt) jwt: IJWT,
    @inject(INTERFACE_TYPE.S3) bucket: IS3,
  ) {
    this.repository = repository;
    this.communicationService = communicationService;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
    this.bucket = bucket;
  }

  public async onCreateAccount(
    data: IOnCreateAccountParam,
  ): Promise<IResponse<ITokens>> {
    const phone_no = data.phone_no.toString();
    const user = await this.repository.findUserByPhoneNo(phone_no);

    if (user) {
      return {
        statusCode: 409,
        body: {
          status: "failed",
          message: "User already exists",
        },
      };
    }

    const newUser = await this.repository.createUser(phone_no);

    const otp = 100000 + Math.floor(Math.random() * 899999);

    const access_token = this.jwt.createToken({
      user: {
        number: phone_no,
      },
      secret: process.env.ACCESS_SECRET!,
      expire: "15m",
    });

    const refresh_token = this.jwt.createToken({
      user: {
        number: phone_no,
      },
      secret: process.env.REFRESH_SECRET!,
      expire: "1y",
    });

    await this.repository.addOtp({
      user: newUser.id,
      otp: await this.bcrypt.hashData(otp.toString()),
    });

    await this.communicationService.sendEmail({
      phone: phone_no,
      message: otp.toString(),
    });

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "An otp has been sent to your email",
        data: {
          access_token: access_token,
          refresh_token: refresh_token,
        },
      },
    };
  }

  public async onVerifyOTP(data: IOnVerifyOtpParam): Promise<IResponse<null>> {
    const user = await this.repository.findUserByPhoneNo(data.number);

    if (user?.verified) {
      return {
        statusCode: 409,
        body: { status: "failed", message: "User is already verified" },
      };
    }

    const validateOTP = await this.bcrypt.compare({
      inputOTP: data.otp.toString(),
      userOTP: user?.otp.otp as string,
    });

    if (!validateOTP) {
      return {
        statusCode: 401,
        body: {
          status: "failed",
          message: "Invalid OTP",
        },
      };
    }

    await this.repository.verifyUser(user?.id as string);

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "User verified",
      },
    };
  }

  public async onSetupUser(
    data: IOnSetupUserParam,
  ): Promise<IResponse<IOnSetupUserResponse>> {
    const image = await this.bucket.uploadFile(
      data.image as Express.Multer.File,
    );

    const user = await this.repository.setUpUser({
      phone_no: data.phone_no,
      image: image,
      username: data.username,
    });

    return {
      statusCode: 200,
      body: {
        status: "success",
        message: "User profile set",
        data: {
          username: user.name as string,
          phone_no: user.phone_no,
          profile_photo: user.profile_photo as string,
        },
      },
    };
  }
}
