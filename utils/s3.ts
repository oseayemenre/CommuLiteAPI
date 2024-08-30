import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { IS3 } from "../interface/s3.interface";
import dotenv from "dotenv";
import { injectable } from "inversify";
import { v4 as uuid } from "uuid";

dotenv.config();

@injectable()
export class S3 implements IS3 {
  private readonly upload: S3Client;

  constructor() {
    this.upload = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: process.env.AWS_S3_REGION!,
    });
  }
  public async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `/upload/${file.filename}-${Date.now()}-${uuid()}`;
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: file.buffer,
    };
    const newFile = new PutObjectCommand(params);

    await this.upload.send(newFile);

    return `http://${process.env.AWS_BUCKET}.s3.${this.upload.config.region}.amazonaws.com/${key}`;
  }
}
