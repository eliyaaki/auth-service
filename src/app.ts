import "dotenv/config";
import log from "./utils/logger";
import connectToDb from "./utils/connectToDb";
import createServer from "./utils/createServer";

const app = createServer();

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  log.info(`application running at: http://localhost:${port}`);
  connectToDb();
});
