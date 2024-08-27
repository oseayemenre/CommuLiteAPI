import { injectable } from "inversify";
import {
  ICommunicationService,
  ISendEmailParams,
  ISendEmailReponse,
} from "../interface/communication-service.interface";

@injectable()
export class TextBelt implements ICommunicationService {
  public async sendEmail(data: ISendEmailParams): Promise<ISendEmailReponse> {
    const response = await fetch("https://textbelt.com/text", {
      method: "POST",
      body: JSON.stringify({
        phone: data.phone,
        message: data.message,
        key: "textbelt",
      }),
    });

    return await response.json();
  }
}
