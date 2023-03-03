import express from "express";
import router from "../routes/index.js";
import deserializeUser from "../middleware/deserializeUser.js";

function createServer() {
  const appServer = express();
  appServer.use(express.json());
  appServer.use(deserializeUser);
  appServer.use(router);
  return appServer;
}

export default createServer;
