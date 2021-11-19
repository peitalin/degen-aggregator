import { Request, Response, NextFunction, Router } from "express";
import {
  throwRouteNotFoundError,
  handlePotentialClientError,
  handleServerError as doHandleServerError
} from "~/utils/express";

// NOTE: These middlewares just delegate to express.ts so that it's more testable.

const handle404Error = (router: Router) => {
  router.use((req: Request, res: Response) => {
    throwRouteNotFoundError();
  });
};

const handleClientError = (router: Router) => {
  router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    handlePotentialClientError(err, req, res, next);
  });
};

const handleServerError = (router: Router) => {
  router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    doHandleServerError(err, req, res, next);
  });
};

export default [handle404Error, handleClientError, handleServerError];
