export interface ICreateTokenParam {
  user: {
    number: string;
  };
  secret: string;
  expire: string;
}

export interface IDecodeTokenParam {
  token: string;
  secret: string;
}

export interface IDecodeTokenReturn {
  number: string;
}

export interface IJWT {
  createToken(data: ICreateTokenParam): string;
  decodeToken(data: IDecodeTokenParam): IDecodeTokenReturn;
}
