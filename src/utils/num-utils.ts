import {isNullOrUndefined, Optional} from "@/utils/core-utils";
import {formatString, isEmpty} from "@/utils/string-utils";
import {assign, isBoolean, isNaN} from "lodash-es";
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

type NumberToTextOptions = {
  appendOne?: boolean;
}
export function numberToText(value: number, options?: NumberToTextOptions, locale?: string): string {
  const UNITS = [
    "صفر", "یک", "دو", "سه", "چهار", "پنج", "شش",
    "هفت", "هشت", "نه", "ده",
    "یازده", "دوازده", "سیزده", "چهارده", "پانزده",
    "شانزده", "هفده", "هجده", "نوزده",
  ];
  const TENS = [
    "بیست", "سی", "چهل", "پنجاه",
    "شصت", "هفتاد", "هشتاد", "نود",
  ];
  const HUNDREDS = [
    "صد", "دویست", "سیصد", "چهارصد", "پانصد",
    "ششصد", "هفتصد", "هشتصد", "نهصد",
  ];
  const THOUSANDS = [
    "هزار", "میلیون", "میلیارد", "بیلیون", "بیلیارد", "تریلیون",
    "تریلیارد", "کوآدریلیون", "کادریلیارد", "کوینتیلیون",
  ];

  function append(t1: string, t2: string, sep: string = " و "): string {
    return isEmpty(t2) ? t1 : isEmpty(t1) ? t2 : t1 + sep + t2;
  }

  if (value == 0) return UNITS[0];

  let text = "";
  let thPow = 0;
  while (value != 0) {
    let t: string;
    const thm = Math.trunc(value % 1000);
    if (thm == 0) {
      t = "";
    } else if (thm == 1 && thPow == 1) {
      t = (options.appendOne ? UNITS[1] + " " : "") + THOUSANDS[0];
    } else {
      let n = thm
      let tv = ""

      if (n >= 100) {
        if (n < 200 && options.appendOne) tv = append(tv, HUNDREDS[0])
        else tv = append(tv, HUNDREDS[Math.trunc(n / 100)])
        n = Math.trunc(n % 100)
      }

      if (n >= 20) {
        tv = append(tv, TENS[Math.trunc(n / 10) - 2])
        n = Math.trunc(n % 10)
      }

      if (n == 1)
        tv = append(tv, UNITS[n])

      if (n > 1)
        tv = append(tv, UNITS[n])

      if (thPow > 0) {
        if (thPow == 1 && options.appendOne) tv = append(tv, THOUSANDS[0], " ")
        else tv = append(tv, THOUSANDS[thPow], " ")
      }

      t = tv;
    }

    text = append(t, text)
    value = Math.trunc(value / 1000)
    thPow += 1
  }

  return text;
}

export function numberToTextEn(value: number, options?: NumberToTextOptions): string {
  const UNITS = [
    "Zero", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const TENS = [
    "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];
  const THOUSANDS = [
    "Hundred", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
    "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion"
  ];

  options = assign(<NumberToTextOptions> { appendOne: true }, options);

  function append(t1: string, t2: string, sep: string = " و "): string {
    return isEmpty(t2) ? t1 : isEmpty(t1) ? t2 : t1 + sep + t2;
  }

  if (value === 0) return UNITS[0];

  let num = value;
  let text = "";
  let thPow = 0;
  while (num != 0) {
    let t: string;
    const thm = Math.trunc(num % 1000);
    if (thm == 0) {
      t = "";
    } else if (thm == 1 && thPow == 1) {
      t = (options.appendOne ? UNITS[1] + " " : "") + THOUSANDS[0];
    } else {
      let n = thm
      let tv = ""

      // if (n >= 100) {
      //   if (n < 200 && options.appendOne) tv = append(tv, HUNDREDS[0])
      //   else tv = append(tv, HUNDREDS[Math.trunc(n / 100)])
      //   n = Math.trunc(n % 100)
      // }

      if (n >= 20) {
        tv = append(tv, TENS[Math.trunc(n / 10) - 2])
        n = Math.trunc(n % 10)
      }

      if (n == 1)
        tv = append(tv, UNITS[n])

      if (n > 1)
        tv = append(tv, UNITS[n])

      if (thPow > 0) {
        if (thPow == 1 && options.appendOne) tv = append(tv, THOUSANDS[0], " ")
        else tv = append(tv, THOUSANDS[thPow], " ")
      }

      t = tv;
    }

    text = append(t, text)
    num = Math.trunc(num / 1000)
    thPow += 1
  }

  return text;
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
