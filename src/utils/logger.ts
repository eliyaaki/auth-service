import logger from "pino";
import dayjs from "dayjs";

type LogLevel = "info" | "error" | "debug";

const logLevel: LogLevel = (process.env.LOG_Level as LogLevel) || "info";
const log = logger({
  transport: {
    target: "pino-pretty",
  },
  level: logLevel,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;
