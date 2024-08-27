export interface ISendEmailParams {
  phone: string;
  message: string;
}

export interface ISendEmailReponse {
  success: boolean;
  quotaRemaining?: number;
  error?: string;
  textId?: string;
}

export interface ICommunicationService {
  sendEmail(data: ISendEmailParams): Promise<ISendEmailReponse>;
}
