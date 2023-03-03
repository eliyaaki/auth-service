import express from "express";
import userRouter from "./user.routes.js";
import authRouter from "./auth.routes.js";

const router = express.Router();

router.get("/healthCheck", (req, res) => {
  res.sendStatus(200);
});
router.use(userRouter);
router.use(authRouter);

export default router;
