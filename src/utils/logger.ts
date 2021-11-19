import * as winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

// Use console locally, or GCP Stackdriver on remote
const getTransport = (): any => {
  if (process.env.NODE_ENV === "production") {
    return new LoggingWinston({
      prefix: "Notify",
      level: "silly"
    });
  } else {
    return new winston.transports.Console({ level: "silly" });
  }
};

const { format } = winston;
export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: format.combine(
    format.splat(), // interpolate %d %s messages
    format.colorize(),
    format.simple()
  ),
  transports: [getTransport()]
});
