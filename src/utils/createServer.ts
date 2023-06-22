import express from "express";
import router from "../routes/index";
import deserializeUser from "../middleware/deserializeUser";

function createServer() {
  const appServer = express();
  appServer.use(express.json());
  appServer.use(deserializeUser);
  appServer.use(router);
  return appServer;
}

export default createServer;
