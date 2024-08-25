import {isUndefined} from "lodash-es";

export class Validator<T = any> implements ReadonlyValidator<T> {
  private readonly _rules = new Map<string, ValidationRule<T>>();

  get rules(): readonly ValidationRule<T>[] { return Array.from(this._rules.values()); }

  constructor(...rules: ValidationRule<T>[]) {
    rules.forEach(rule => this._rules.set(rule.name, rule));
  }

  addRules(...rules: ValidationRule<T>[]): this {
    rules.forEach(rule => this._rules.set(rule.name, rule));
    return this;
  }

  removeRules(...rules: string[]): this {
    rules.forEach(ruleName => this._rules.delete(ruleName));
    return this;
  }

  removeAllRules(): this {
    this._rules.clear();
    return this;
  }

  hasRule(name: string): boolean {
    return this._rules.has(name);
  }

  validate(value: T, abortEarly = true, args: any[] = []): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this._rules.values()) {
      if (isUndefined(value) && rule.ignoreUndefined !== false) continue;
      const result = rule.test(value, ...args);
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

export type ReadonlyValidator<T> = Omit<Validator<T>,
  "addRules" |
  "removeRules" |
  "removeAllRules"
>;

export interface ValidationRule<T> {
  readonly name: string;
  test(value: T, ...args: any[]): boolean | undefined;
  readonly message: string;
  /** ignore undefined values from validation. default is true */
  readonly ignoreUndefined?: boolean;
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
