export interface IResponse<T> {
  statusCode: number;
  body: {
    status: "success" | "failed";
    message: string;
    data?: T;
  };
}
