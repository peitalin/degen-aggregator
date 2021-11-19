import {
  validateSync,
  ValidationError,
  Matches,
  ValidationOptions,
  IsString,
  MaxLength
} from "class-validator";
import {
  userIdRegex,
  productIdRegex,
  productVariantIdRegex,
  productVariantSnapshotIdRegex,
  imageIdRegex,
  fileIdRegex,
  productSnapshotIdRegex,
  idMaxLength,
} from "~/limitsAndRules";
import { BadInputError } from "./errors";

// This file contains functions that use class-validator to assist with validation objectives

export const validateOrThrow = (input: any, contextString: string) => {
  const maybeErrors = validateSync(input);
  if (maybeErrors.length > 0) {
    const details = accumulateValidationErrors(maybeErrors);
    throw new BadInputError(
      `Validation failed for request ${contextString}:${details}`
    );
  }
};

// Recursive function to gather error information for potentially nested problems
const accumulateValidationErrors = (errors: ValidationError[]): string => {
  const details = errors.map((e: ValidationError) => {
    if (e.constraints) {
      const keys = Object.keys(e.constraints);
      const issues = keys.map(k => {
        return `\n${e.constraints[k]}`;
      });
      return `${issues}\n(value provided: ${JSON.stringify(e.value)})`;
    } else {
      return `\nIn: ${e.property}...${accumulateValidationErrors(e.children)}`;
    }
  });
  return details.join("");
};

// Helper to combine IsString, MaxLength, and regex Match for ID typecheck purposes
function IsIDMatchingRegex(
  regex: RegExp,
  validationOptions?: ValidationOptions
): Function {
  const isString = IsString(validationOptions);
  const maxLength = MaxLength(idMaxLength, validationOptions);
  const matchesRegex = Matches(regex, validationOptions);
  return function(target: any, key: string) {
    isString(target, key);
    maxLength(target, key);
    matchesRegex(target, key);
  };
}


export function IsUserId(validationOptions?: ValidationOptions): Function {
  return IsIDMatchingRegex(userIdRegex, validationOptions);
}
export function IsProductId(validationOptions?: ValidationOptions): Function {
  return IsIDMatchingRegex(productIdRegex, validationOptions);
}

export function IsProductSnapshotId(
  validationOptions?: ValidationOptions
): Function {
  return IsIDMatchingRegex(productSnapshotIdRegex, validationOptions);
}

export function IsVariantId(validationOptions?: ValidationOptions): Function {
  return IsIDMatchingRegex(productVariantIdRegex, validationOptions);
}

export function IsVariantSnapshotId(
  validationOptions?: ValidationOptions
): Function {
  return IsIDMatchingRegex(productVariantSnapshotIdRegex, validationOptions);
}

export function IsImageId(validationOptions?: ValidationOptions): Function {
  return IsIDMatchingRegex(imageIdRegex, validationOptions);
}

export function IsFileId(validationOptions?: ValidationOptions): Function {
  return IsIDMatchingRegex(fileIdRegex, validationOptions);
}
