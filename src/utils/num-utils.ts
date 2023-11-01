import {isNaN} from "lodash-es";
import {isNullOrUndefined, Optional} from "@/utils/core-utils";

export function sanitizeFloat(value: any): Optional<number> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const realValue = parseFloat(value);
  if (isNaN(realValue)) return undefined;
  return realValue;
}

export function sanitizeInteger(value: any): Optional<number> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const realValue = parseInt(value);
  if (isNaN(realValue)) return undefined;
  return realValue;
}

export function computePercent(number: number, percent: number): number {
  return (number * percent) / 100;
}

export function isNumeric(value: any): boolean {
  const valueType = typeof value;
  return valueType === "number" || (valueType === "string" && /^[+-]?(\.\d+|\d+\.?\d*)$/.test(value));
}
