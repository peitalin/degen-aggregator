import { Router } from "express";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import chalk from "chalk";
import { logger } from "~/utils/logger";

export const handleBodyRequestParsing = (router: Router) => {
  router.use(bodyParser.json());
};

export const handleRequestLogging = (router: Router) => {
  const format: morgan.FormatFn = (tokens, req, res) => {
    return [
      chalk.green.bold(tokens.method(req, res)),
      chalk.white.bold(tokens.url(req, res)),
      chalk.white("=>"),
      chalk.cyan(`[${tokens.status(req, res)}]`),
      chalk.white(tokens["response-time"](req, res) + " ms")
    ].join(" ");
  };
  const options: morgan.Options = {
    // Route the output from Morgan into our regular Winston logger
    stream: {
      write: line => {
        logger.info(line.slice(0, -1)); // trim to avoid a second newline
      }
    }
  };
  const middleware = morgan(format, options);
  router.use(middleware);
};
