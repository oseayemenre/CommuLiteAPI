export interface IS3 {
  uploadFile(file: Express.Multer.File): Promise<string>;
}
