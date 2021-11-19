import { logger } from "./logger";

// Base for any errors we throw (ideally, but not a big deal)
export abstract class ErrorBase extends Error {
  readonly name!: string;

  constructor(message: object | string) {
    if (message instanceof Object) {
      super(JSON.stringify(message));
    } else {
      super(message);
    }
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// An error that represents lack of authentication
export class AuthenticationError extends ErrorBase {
  constructor(message: string | object = "Not authenticated") {
    super(message);
  }
}

// An error that represents lack of authorization
export class AuthorizationError extends ErrorBase {
  constructor(message: string | object = "Not authorized") {
    super(message);
  }
}

// An error that represents bad input of some kind
export class BadInputError extends ErrorBase {
  constructor(message: string | object = "Bad Input") {
    super(message);
  }
}

// An error representing when we expected to find something but didn't
export class NotFoundError extends ErrorBase {
  constructor(message: string | object = "Not Found") {
    super(message);
  }
}

// Some other unexplained thing happened
export class GeneralServerError extends ErrorBase {
  constructor(message: string | object = "Something Went Wrong") {
    super(message);
  }
}

// Call when an error is encountered that isn't an expected part of normal operation
export const handleFatalError = async (error: Error) => {
  await reportError(error, null);
  process.exit(1);

  // NOTE: We exit the app so that it can be restarted, in the hopes that no further issues occur as a result of this.
};

// Call when an error occurs (recoverable or otherwise) and it should be reported
export const reportError = async (
  error: Error,
  metadata: object | null
): Promise<void> => {
  let message: string;
  if (metadata) {
    message = `Server ${error.stack}\nMetadata: ${JSON.stringify(
      metadata,
      null,
      2
    )}`;
  } else {
    message = `Server ${error.stack}`;
  }
  logger.error(message);
};

export const handleUncaughtException = (e: Error) => {
  // Add context and treat as fatal
  e.message = `uncaughtException: ${e.message}`;
  handleFatalError(e);
}

export const handleUnhandledRejection = (e: {} | null | undefined) => {
  // Convert whatever this is into a fatal error
  let error: Error;
  if (e instanceof Error) {
    error = e;
    error.message = `unhandledRejection: ${e.message}`;
  } else {
    error = new Error(`unhandledRejection: ${e}`);
  }
  handleFatalError(error);
}

export const handleSigterm = () => {
  console.log('Google Cloud Run: received SIGTERM, exiting gracefully');
  process.exit(0);
}