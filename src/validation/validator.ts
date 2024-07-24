import {isUndefined} from "lodash-es";

export class Validator<T = any> {
  constructor(private readonly rules: ValidationRule<T>[]) {
  }

  addRules(...rules: ValidationRule<T>[]): this {
    this.rules.push(...rules);
    return this;
  }

  validate(value: T, abortEarly = true, args: any[] = []): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this.rules) {
      if (isUndefined(value) && rule.ignoreUndefined !== false) continue;
      const result = rule.test(value);
      if (isUndefined(result)) continue;
      if (!result) {
        errors.push(new ValidationError(rule.message.format([value, ...args]), rule.name));
        if (abortEarly) break;
      }
    }
    return errors;
  }

  validateAndThrow(value: T, abortEarly = true, args: any[] = []): void {
    const errors = this.validate(value, abortEarly, args);
    if (errors.length == 1) throw errors[0];
    else if (errors.length > 1) throw new AggregateValidationError(errors);
  }
}

export interface ValidationRule<T> {
  readonly name?: string;
  test(value: T): boolean | undefined;
  message: string;
  /** ignore undefined values from validation. default is true */
  ignoreUndefined?: boolean;
}

export class ValidationError extends Error {
  constructor(message?: string, readonly rule?: string) {
    super(message ?? ((rule ?? "Validation") + " failed."));
  }
}

export class AggregateValidationError extends ValidationError {
  constructor(readonly errors: readonly ValidationError[]) {
    super(errors.map(err => err.message).join("\n"));
  }
}
