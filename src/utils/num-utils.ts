import {isNullOrUndefined, Optional, StringMap} from "@/utils/core-utils";
import {assign, isNaN, toNumber} from "lodash-es";
import AutoNumeric, {Options} from "autonumeric";

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

export function isValidInteger(value: any): boolean {
  return (typeof sanitizeInteger(value) == "number");
}

export function computePercent(number: number, percent: number): number {
  return (number * percent) / 100;
}

export function isNumeric(value: any): boolean {
  const valueType = typeof value;
  return valueType === "number" || (valueType === "string" && /^[+-]?(\.\d+|\d+\.?\d*)$/.test(value));
}

export function isBetween(value: number, min: number, max: number, inclusive = false): boolean {
  return inclusive
    ? value >= min && value <= max
    : value >= min && value < max;
}

const localeOptions: StringMap<{altCurrencySymbol?: string} & Options> = {
  fa: {
    digitGroupSeparator: '°',
    decimalCharacter: '/',
    currencySymbol: ' ' + '—Ì«·',
    altCurrencySymbol: ' ' + ' Ê„«‰',
    currencySymbolPlacement: 's'
  },
  en: {
    digitGroupSeparator: ',',
    decimalCharacter: '.',
    currencySymbol: '$' + ' ',
    currencySymbolPlacement: 'p'
  }
};

export function formatNumber(value: number, locale?: string, currency = false): string {
  const options = assign({}, AutoNumeric.getDefaultConfig(), <Options>{
    allowDecimalPadding: false
  }, localeOptions[locale ?? "en"]);

  if (!currency) {
    delete options.currencySymbol;
  }

  return AutoNumeric.format(toNumber(value), options);
}

/* extensions methods */
export {}
declare global {
  interface Number {
    isBetween(min: number, max: number, inclusive?: boolean): boolean;
    format(locale?: string, currency?: boolean): string;
  }
}

Number.prototype.isBetween = function (min: number, max: number, inclusive = false): boolean {
  return isBetween(this as number, min, max, inclusive);
};

Number.prototype.format = function (locale?: string, currency = false): string {
  return formatNumber(this as number, locale, currency);
};
