export interface ICompareParam {
  inputOTP: string;
  userOTP: string;
}

export interface IBcrypt {
  hashData(data: string): Promise<string>;
  compare(data: ICompareParam): Promise<boolean>;
}
