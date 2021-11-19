// Convert all module path aliases into full paths before anything imports them
require("module-alias/register");
import {
  handleUncaughtException,
  handleUnhandledRejection,
  handleSigterm,
} from "~/utils/errors";


process.on("uncaughtException", handleUncaughtException);
process.on("unhandledRejection", handleUnhandledRejection);
process.on('SIGTERM', handleSigterm);

// // Validate environment
// import { checkEnv, setRequiredEnvironmentVariables } from "~/utils/env-checker";
// const requiredVariables: string[] = [
//   // "GUN_ENV",
//   // "SENDGRID_API_KEY",
//   // "DATABASE_URL",
//   // "GUN_USER_URL",
// ];
// setRequiredEnvironmentVariables(requiredVariables);
// checkEnv();

// Some of these imports may do things immediately (via const), hence they're after the above
import * as express from "express";
import {
  applyMiddleware,
  applyRoutes,
  // applyHealthCheck
} from "./utils/express";
import middleware from "./middleware";
import routes from "./routes";
import { logger } from "./utils/logger";
// import { initPuppetBrowser } from "./puppet";
// import errorHandlers from "./middleware/errorHandlers";

// Setup Express routes and middleware
const app: express.Express = express();
applyMiddleware(middleware, app);
applyRoutes(routes, app);
// applyHealthCheck(app);
// applyMiddleware(errorHandlers, app);

// Start serving
// NOTE: Overriding NODE_PORT is really just if you want to use npm run dev. Otherwise use Docker to manage ports.
const port = process.env.PORT || 8080;


app.listen(port, async () => {
  logger.info(`Created a server at: http://0.0.0.0:${port}`);
});


