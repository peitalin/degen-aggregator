import { Request, Response, NextFunction } from "express";
import { IsString } from "class-validator";
import { ID } from "./typings";

// e.g. for route inputs, etc

// Our supported HTTP methods
export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  OPTIONS = "options"
}

// Type of a callback that will receive strongly typed route input parameters.
export type RouteHandler<
  Params extends Validatable,
  Query extends Validatable,
  Body extends Validatable
> = (
  req: Request,
  res: Response,
  next: NextFunction,
  params: Params,
  query: Query,
  body: Body
) => Promise<void> | void;

// Strongly type route spec. Validation is automatic via the provided types.
export interface Route<
  Params extends Validatable,
  Query extends Validatable,
  Body extends Validatable
> {
  // Route path eg "/user"
  path: string;

  // HTTP method eg GET, POST
  method: HttpMethod;

  // Type to extract for the request's query parameters
  queryType: ValidatableConstructor<Query>;

  // Type to extract for the request's route parameters
  paramsType: ValidatableConstructor<Params>;

  // Type to extract for the request's body parameters
  bodyType: ValidatableConstructor<Body>;

  // The handler of the route request.
  // This receives strongly typed post-validated inputs.
  handler: RouteHandler<Params, Query, Body>;
}

// Base for classes that can be used to validate route inputs.
export interface Validatable {}

/**
 * Something that can construct a specific Validatable.
 *
 * This is a bit of a weird Typescript hack, see `instantiateValidatable` and
 * https://www.typescriptlang.org/docs/handbook/generics.html#using-class-types-in-generics
 *
 * Basically, we want to take an input of `any` and extract fields inside the constructor of
 * a specific type of Validatable. But in the pipeline we want to call those constructors to
 * make new instances of the Validatable in a context where the type of Validatable is generic.
 */
export interface ValidatableConstructor<T> {
  new (input: any): T;
}

// Create an instance of a Validatable of a specific type.
export function instantiateValidatable<T extends Validatable>(
  type: ValidatableConstructor<T>,
  input: any
): T {
  return new type(input);
}

// An empty Validatable to use when you're not expecting inputs for a particular part of the request.
// For example if there are no query string parameters, use this for queryType in Route.
export class Empty implements Validatable {
  constructor(input: any) {}
}

export const extractValidatableArray = <T extends Validatable>(
  maybeArrayInput: any,
  elementType: ValidatableConstructor<T>
): T[] | undefined => {
  if (maybeArrayInput && Array.isArray(maybeArrayInput)) {
    return maybeArrayInput.map(item =>
      instantiateValidatable(elementType, item)
    );
  } else {
    return undefined;
  }
};

/// Query string parameters for "ids=abc,def,ghi" pattern
export class IdsQuery implements Validatable {
  @IsString()
  ids: string;

  constructor(input: any) {
    this.ids = input.ids;
  }
}

export class CommonOwnerParams implements Validatable {
  @IsString()
  ownerId: ID;

  constructor(input: any) {
    this.ownerId = input.ownerId;
  }
}
