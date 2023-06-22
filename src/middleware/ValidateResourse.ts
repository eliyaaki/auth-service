import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import log from "../utils/logger";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      log.info("Validate Resource: " + req);
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      log.error("Error Validate Resource: " + error);
      return res.status(400).send(error.errors);
    }
  };

export default validateResource;
