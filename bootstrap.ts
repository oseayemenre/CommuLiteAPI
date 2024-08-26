import dotenv from "dotenv";
import { Application } from "./application";

dotenv.config();

function main(): void {
  const app = new Application().getServer();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server is currently listening on port: ${port}`);
  });
}

main();
