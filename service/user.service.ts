import { injectable, inject } from "inversify";
import { IBcrypt } from "../interface/bcrypt.interface";
import { ICommunicationService } from "../interface/communication-service.interface";
import {
  IOnCreateAccountParam,
  IResponse,
  IUserRepository,
  IUserService,
} from "../interface/user.interface";
import { INTERFACE_TYPE } from "../utils/dependency";

@injectable()
export class UserService implements IUserService {
  private readonly repository: IUserRepository;
  private readonly communicationService: ICommunicationService;
  private readonly bcrypt: IBcrypt;

  constructor(
    @inject(INTERFACE_TYPE.UserRepository) repository: IUserRepository,
    @inject(INTERFACE_TYPE.CommunicationService)
    communicationService: ICommunicationService,
    @inject(INTERFACE_TYPE.Bcrypt) bcrypt: IBcrypt
  ) {
    this.repository = repository;
    this.communicationService = communicationService;
    this.bcrypt = bcrypt;
  }

  public async onCreateAccount(
    data: IOnCreateAccountParam
  ): Promise<IResponse<void>> {
    const phone_no = data.phone_no.toString();
    const user = await this.repository.findUser(phone_no);

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
      },
    };
  }
}
