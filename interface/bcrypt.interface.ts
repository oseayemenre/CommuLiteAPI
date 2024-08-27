export interface IBcrypt {
  hashData(data: string): Promise<string>;
}
