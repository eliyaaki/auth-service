// require("dotenv").config();
// import * as dotenv from "dotenv";
// dotenv.config();
import "dotenv/config";
import log from "./utils/logger.js";
import connectToDb from "./utils/connectToDb.js";
import createServer from "./utils/createServer.js";

const app = createServer();

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  log.info(`application running at: http://localhost:${port}`);
  connectToDb();
});
