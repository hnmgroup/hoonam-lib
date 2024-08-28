import {get, isArray, isUndefined} from "lodash-es";
import {isAbsent, Optional} from "@/utils/core-utils";

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
      if (isAbsent(value) && !rule.acceptEmpty) continue;
      const failedRule = testRule<T>(rule, value, args);
      if (isUndefined(failedRule)) continue;
      errors.push(new ValidationError(
        failedRule.message.format([value, ...args]),
        failedRule.name,
      ));
      if (abortEarly) break;
    }
    return errors;
  }

  validateAndThrow(value: T, abortEarly = true, args: any[] = []): void {
    const errors = this.validate(value, abortEarly, args);
    if (errors.length == 1) throw errors[0];
    else if (errors.length > 1) throw new AggregateValidationError(errors);
  }
}

export function testRule<T>(rule: ValidationRule<T>, value: T, args: any[]): Optional<ValidationRule<T>> {
  if (isAbsent(value) && !rule.acceptEmpty) return undefined;

  const rules = get(rule, RULES_SYMBOL) as ValidationRule<T>[];
  const isComposeRule = isArray(rules);

  if (!isComposeRule) {
    const result = rule.test(value, ...args);
    return result === false ? rule : undefined;
  }

  for (const r of rules) {
    const fr = testRule(r, value, args);
    if (fr) return fr;
  }

  return undefined;
}

export const RULES_SYMBOL = Symbol("RulesSymbol");

export type ReadonlyValidator<T> = Omit<Validator<T>,
  "addRules" |
  "removeRules" |
  "removeAllRules"
>;

export interface ValidationRule<T> {
  readonly name: string;
  test(value: T, ...args: any[]): boolean | undefined;
  readonly message: string;
  readonly acceptEmpty?: boolean;
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
