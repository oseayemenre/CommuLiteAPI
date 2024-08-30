import multer from "multer";

export class Multer {
  public readonly upload: multer.Multer;
  constructor() {
    this.upload = multer({ dest: "uploads" });
  }
}
