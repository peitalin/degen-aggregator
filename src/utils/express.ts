import {
  Router,
  Response,
  NextFunction,
  Request,
  RequestHandler
} from "express";
import { Route, Validatable, instantiateValidatable } from "~/routeTypings";
import { logger } from "./logger";
import {
  handleFatalError,
  ErrorBase,
  BadInputError,
  NotFoundError
} from "./errors";
import { validateOrThrow } from "./class-validator";
import appIsHealthy from "./health";

type MiddlewareWrapper = (router: Router) => void;

// Helper to apply a set of middlewares
export const applyMiddleware = (
  middlewareWrappers: MiddlewareWrapper[],
  router: Router
) => {
  for (const wrapper of middlewareWrappers) {
    wrapper(router);
  }
};

// Helper to apply multiple strongly typed routes
export const applyRoutes = <
  Params extends Validatable,
  Query extends Validatable,
  Body extends Validatable
>(
  routes: Route<Params, Query, Body>[],
  router: Router
) => {
  for (const route of routes) {
    // Register a handler with Express
    (router as any)[route.method](
      route.path,
      catchingRouteHandler(async (req, res, next) => {
        // (this wrapped handler will catch unhandled rejections)

        // Extract and validate all of the route inputs
        const paramsInput = instantiateValidatable(
          route.paramsType,
          req.params
        );
        validateOrThrow(paramsInput, "route parameters");
        const queryInput = instantiateValidatable(route.queryType, req.query);
        validateOrThrow(queryInput, "query");
        const bodyInput = instantiateValidatable(route.bodyType, req.body);
        validateOrThrow(bodyInput, "body");

        // Perform the actual handling with pre-validated inputs
        await route.handler(req, res, next, paramsInput, queryInput, bodyInput);
      })
    );
  }
};

// Helper that wraps a handler to automatically catch unhandled rejections
const catchingRouteHandler = (requestHandler: RequestHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};

export const throwRouteNotFoundError = () => {
  throw new NotFoundError("Route and/or method not found");
};

export const handlePotentialClientError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prepend the route path in the message for context
  err.message = `${req.originalUrl}\n${err.message}`;

  // Send response if it's a known type
  if (err instanceof BadInputError) {
    logger.warn(`${err}`);
    res.status(400).send(err.message);
  } else if (err instanceof NotFoundError) {
    logger.warn(`${err}`);
    res.status(404).send(err.message);
  } else {
    next(err);
  }
};

export const handleServerError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Send back an approprate response to client
  if (process.env.GUN_ENV === "production") {
    res.status(500).send("Internal Server Error");
  } else {
    res.status(500).send(err.stack);
  }

  // Treat as a fatal scenario
  handleFatalError(err);
};

export const applyHealthCheck = (router: Router) => {
  router.get("/_health", (req: Request, res: Response, next: NextFunction) => {
    appIsHealthy().then(isHealthy => {
      isHealthy ? res.send({ isHealthy }) : res.status(503).send({ isHealthy });
    });
  });
};
