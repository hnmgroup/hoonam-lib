import {isNullOrUndefined, Optional} from "@/utils/core-utils";
import {formatString} from "@/utils/string-utils";
import {isBoolean, isNaN} from "lodash-es";
import {getCurrencySymbol, getPercentSymbol, resolveLocale} from "@/i18n";

export function sanitizeFloat(value: any): Optional<number> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const realValue = parseFloat(value);
  if (isNaN(realValue)) return undefined;
  return realValue;
}

export function sanitizeInteger(value: any, radix?: number): Optional<number> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const realValue = parseInt(value, radix);
  if (isNaN(realValue)) return undefined;
  return realValue;
}

export function computePercent(number: number, percent: number): number {
  return (number * percent) / 100;
}

export function isBetween(
  value: number,
  min: number,
  max: number,
  mode?: boolean | "[)" | "(]" | "[]" | "()",
): boolean {
  mode ??= true;
  if (isBoolean(mode)) mode = mode ? "[]" : "()";
  return (mode.startsWith('[') ? value >= min : value > min) &&
         (mode.endsWith(']') ? value <= max : value < max);
}

export function formatNumber(value: number, format?: string, locale?: string): string {
  format ??= "n";
  const localeInfo = resolveLocale(locale);

  if (format[0].toLowerCase() == "b") {
    return value.toString(2).padStart(parseInt(format.substring(1) ?? "1"), '0');
  }

  if (format[0].toLowerCase() == "x") {
    const result = value.toString(16).padStart(parseInt(format.substring(1) ?? "1"), '0');
    return format[0] == 'x' ? result.toLowerCase() : result.toUpperCase();
  }

  if (format[0].toLowerCase() == "c") {
    if (localeInfo.numberFormats.currencyFormat) {
      return formatString(localeInfo.numberFormats.currencyFormat, {
        value: formatNumber(value, undefined, locale),
        symbol: getCurrencySymbol(locale),
      });
    }

    return new Intl.NumberFormat(localeInfo.name, {
        style: "currency",
        currency: localeInfo.numberFormats.currencyCode,
        currencyDisplay: "symbol",
      }).format(value);
  }

  if (format[0].toLowerCase() == "d") {
    return new Intl.NumberFormat(localeInfo.name, {
      style: "decimal",
      useGrouping: true,
      minimumIntegerDigits: parseInt(format.substring(1) ?? "1"),
    }).format(value);
  }

  if (format[0].toLowerCase() == "n") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, {
      style: "decimal",
      useGrouping: true,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  }

  if (format[0].toLowerCase() == "g") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, {
      style: "decimal",
      notation: "standard",
      useGrouping: false,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }

  if (format[0].toLowerCase() == "e") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    const result = new Intl.NumberFormat(localeInfo.name, {
      style: "scientific",
      notation: "scientific",
      useGrouping: false,
      minimumFractionDigits: fractionDigits,
    }).format(value);
    return format[0] == 'e' ? result.toLowerCase() : result.toUpperCase();
  }

  if (format[0].toLowerCase() == "f") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, {
      style: "decimal",
      useGrouping: false,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  }

  if (format[0].toLowerCase() == "p") {
    const exactValue = format.includes('e');
    if (exactValue) format = format.replace('e', "");
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    if (exactValue) value /= 100;
    if (localeInfo.numberFormats.percentFormat) {
      return formatString(localeInfo.numberFormats.percentFormat, {
        value: formatNumber(value * 100, undefined, locale),
        sign: getPercentSymbol(locale),
      });
    }
    return new Intl.NumberFormat(localeInfo.name, {
      style: "percent",
      useGrouping: true,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  }

  throw new Error("invalid number format: " + format);
}

/* extensions */

Number.prototype.isBetween = function (
  min: number,
  max: number,
  mode?: boolean | "[)" | "(]" | "[]" | "()"
): boolean {
  return isBetween(this as number, min, max, mode);
};

Number.prototype.format = function (format?: string, locale?: string): string {
  return formatNumber(this as number, format, locale);
};

Number.prototype.percent = function (percent: number): number {
  return computePercent(this as number, percent);
};

Number.prototype.pow = function (power: number): number {
  return Math.pow(this as number, power);
};

Number.prototype.trunc = function (): number {
  return Math.trunc(this as number);
};

Number.prototype.ceil = function (): number {
  return Math.ceil(this as number);
};

Number.prototype.floor = function (): number {
  return Math.floor(this as number);
};

Number.prototype.round = function (): number {
  return Math.round(this as number);
};

Number.prototype.fround = function (): number {
  return Math.fround(this as number);
};

Number.prototype.abs = function (): number {
  return Math.abs(this as number);
};

Number.prototype.exp = function (): number {
  return Math.exp(this as number);
};

String.prototype.toInt = function (radix?: number): Optional<number> {
  return sanitizeInteger(this, radix);
};

String.prototype.toFloat = function (): Optional<number> {
  return sanitizeFloat(this);
};
