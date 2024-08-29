import {isAbsent, Optional} from "@/utils/core-utils";
import {get, isArray} from "lodash-es";
import {ValidationRule} from "./validator";

export const RULES_SYMBOL = Symbol("RulesSymbol");

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
