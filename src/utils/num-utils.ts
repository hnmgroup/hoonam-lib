import {isNullOrUndefined, Optional} from "@/utils/core-utils";
import {assign, isBoolean, isNaN, toNumber} from "lodash-es";
import AutoNumeric, { Options } from "autonumeric";
import {resolve} from "@/bind";
import {getLocale, I18n} from "@/i18n";

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

type BetweenMode = boolean | "[)" | "(]" | "[]" | "()";

export function isBetween(
  value: number,
  min: number,
  max: number,
  mode?: BetweenMode,
): boolean {
  mode ??= true;
  if (isBoolean(mode)) mode = mode ? "[]" : "()";
  return (mode.startsWith('[') ? value >= min : value > min) &&
         (mode.endsWith(']') ? value <= max : value < max);
}

export function formatNumber(value: number, locale?: string): string {
  locale ??= resolve(I18n).locale.name;
  const localeOptions = locale ??= resolve(I18n).locale.name;
  const options = assign(
    {},
    AutoNumeric.getDefaultConfig(),
    <Options> { allowDecimalPadding: false },
    getLocale(locale).numberFormats,
  );

  delete options.currencySymbol;

  return AutoNumeric.format(toNumber(value), options);
}

/* extensions */
import "./num-utils.d";

Number.prototype.isBetween = function (min: number, max: number, mode?: BetweenMode): boolean {
  return isBetween(this as number, min, max, mode);
};

Number.prototype.format = function (locale?: string): string {
  return formatNumber(this as number, locale);
};

Number.prototype.percent = function (percent: number): number {
  return computePercent(this as number, percent);
};
