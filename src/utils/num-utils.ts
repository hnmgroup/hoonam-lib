import {omitEmpty, Optional} from "@/utils/core-utils";
import {formatString, isBlank, sanitizeNumeric} from "@/utils/string-utils";
import {isBoolean, isNaN, isString} from "lodash-es";
import {ENGLISH_LOCALE, getCurrencySymbol, getPercentSymbol, PERSIAN_LOCALE, resolveLocale} from "@/i18n";

export function sanitizeNumber(value: any): Optional<number> {
  if (isBlank(value)) return undefined;
  if (isNaN(value)) return undefined;
  if (isString(value)) value = sanitizeNumeric(value);
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
}

export function sanitizeInteger(value: any): Optional<number> {
  if (isBlank(value)) return undefined;
  if (isNaN(value)) return undefined;
  if (isString(value)) value = sanitizeNumeric(value);
  const num = parseFloat(value);
  if (isNaN(num) || Math.trunc(num) !== num) return value;
  return num;
}

export function calculatePercent(number: number, percent: number): number {
  return (number * percent) / 100;
}

export function compareNumbers(n1: number, n2: number): number {
  return n1 > n2 ? 1 : n1 < n2 ? -1 : 0;
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

export type NumberToWordsOptions = {
  baseSeparator?: boolean;
  decimalPoint?: string;
};

export function numberToWordsFa(num: number): string {
  const CARDINALS = [
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
  const SCALES = [
    "هزار", "میلیون", "میلیارد", "بیلیون", "بیلیارد",
    "تریلیون", "تریلیارد", "کوآدریلیون", "کادریلیارد", "کوینتیلیون",
  ];

  function n2w(num: number, scale: number = 0): string {
    const parts: string[] = [];

    if (num >= 1000) {
      parts.push(n2w(Math.floor(num / 1000), scale + 1));
      num %= 1000;
    }

    if (num >= 100) {
      parts.push(HUNDREDS[Math.floor(num / 100) - 1]);
      num %= 100;
    }

    if (num > 20) {
      parts.push(TENS[Math.floor(num / 10) - 2]);
      num %= 10;
    }

    if (num > 0) {
      if (num == 1 && scale == 1) parts.push(SCALES[0]);
      else parts.push(CARDINALS[num]);
    }

    if (parts.length == 0 && scale == 0) {
      parts.push(CARDINALS[0]);
    }

    let result = parts.join(" و ");

    if (scale > 0 && num > 0) {
      if (!(num == 1 && scale == 1))
        result += " " + SCALES[scale - 1];
    }

    return result;
  }

  const isNegative = num < 0;
  if (isNegative) num = Math.abs(num);

  const integerPart = Math.floor(num);
  const fractionPartS = num.toString().split('.')[1];
  const fractionPart = parseInt(fractionPartS ?? "0", 10);

  let result = n2w(integerPart);

  if (fractionPart > 0) {
    let fractionalWords = n2w(fractionPart);

    if (integerPart != 0) result += " " + "ممیز" + " ";
    else result = "";
    result += fractionalWords;

    const fractionScale = Math.floor(fractionPartS.length / 3);
    const fractionNum = fractionPartS.length % 3;
    let fractionText = "";
    if (fractionNum == 1) fractionText = CARDINALS[10];
    if (fractionNum == 2) fractionText = HUNDREDS[0];
    if (fractionScale > 0) fractionText += (fractionNum == 1 ? "\u200C" : "") + SCALES[fractionScale - 1];
    fractionText += "م";

    result += " " + fractionText;
  }

  if (isNegative) result = "منفی" + " " + result;

  return result;
}

export function numberToWordsEn(num: number, options?: NumberToWordsOptions): string {
  const CARDINALS = [
    "Zero", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const TENS = [
    "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety", "Hundred",
  ];
  const SCALES = [
    "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
    "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion",
  ];

  const baseSeparator = options?.baseSeparator ?? true;
  const decimalPoint = options?.decimalPoint ?? "Point";

  function n2w(num: number, scale: number = 0): string {
    const parts: string[] = [];

    if (num >= 1000) {
      parts.push(n2w(Math.floor(num / 1000), scale + 1));
      num %= 1000;
    }

    if (num >= 100) {
      parts.push(CARDINALS[Math.floor(num / 100)] + " " + TENS[8]);
      num %= 100;
    }

    if (num > 20) {
      let ten = TENS[Math.floor(num / 10) - 2];
      const base = num % 10;
      if (base > 0) {
        if (baseSeparator) ten += "-" + CARDINALS[base].toLowerCase();
        else ten += " " + CARDINALS[base];
      }
      parts.push(ten);
      num = base;
    }

    else if (num > 0) {
      parts.push(CARDINALS[num]);
    }

    if (parts.length == 0 && scale == 0) {
      parts.push(CARDINALS[0]);
    }

    let result = parts.join(" ");

    if (scale > 0 && num > 0) {
      result += " " + SCALES[scale - 1];
    }

    return result;
  }

  const isNegative = num < 0;
  if (isNegative) num = Math.abs(num);

  const integerPart = Math.floor(num);
  const fractionPartS = num.toString().split('.')[1];
  const fractionPart = parseInt(fractionPartS ?? "0", 10);

  let result = n2w(integerPart);

  if (fractionPart > 0) {
    let fractionalWords = n2w(fractionPart);

    if (integerPart != 0) result += " " + decimalPoint + " ";
    else result = "";
    result += fractionalWords;

    const fractionScale = Math.floor(fractionPartS.length / 3);
    const fractionNum = fractionPartS.length % 3;
    let fractionText = "";
    if (fractionNum == 1) fractionText = CARDINALS[10];
    if (fractionNum == 2) fractionText = TENS[8];
    if (fractionScale > 0) fractionText += (fractionText.length > 0 ? "-" : "") + SCALES[fractionScale - 1];
    fractionText += "th";
    if (fractionPart > 1) fractionText += "s";

    result += " " + fractionText;
  }

  if (isNegative) result = "Negative" + " " + result;

  return result;
}

export function numberToWords(num: number, locale?: string, options?: NumberToWordsOptions): string {
  const localeInfo = resolveLocale(locale);

  if (localeInfo.name == ENGLISH_LOCALE.name)
    return numberToWordsEn(num, options);

  if (localeInfo.name == PERSIAN_LOCALE.name)
    return numberToWordsFa(num);

  throw new Error("number to words locale not supported: " + locale);
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
    const minIntegerDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, omitEmpty({
      style: "decimal",
      useGrouping: false,
      minimumIntegerDigits: minIntegerDigits,
    })).format(value);
  }

  if (format[0].toLowerCase() == "n") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, omitEmpty({
      style: "decimal",
      useGrouping: true,
      minimumFractionDigits: fractionDigits,
    })).format(value);
  }

  if (format[0].toLowerCase() == "g") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, omitEmpty({
      style: "decimal",
      notation: "standard",
      useGrouping: false,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })).format(value);
  }

  if (format[0].toLowerCase() == "e") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    const result = new Intl.NumberFormat(localeInfo.name, omitEmpty({
      style: "scientific",
      notation: "scientific",
      useGrouping: false,
      minimumFractionDigits: fractionDigits,
    })).format(value);
    return format[0] == 'e' ? result.toLowerCase() : result.toUpperCase();
  }

  if (format[0].toLowerCase() == "f") {
    const fractionDigits = format.length > 1 ? parseInt(format.substring(1)) : undefined;
    return new Intl.NumberFormat(localeInfo.name, omitEmpty({
      style: "decimal",
      useGrouping: false,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })).format(value);
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
    return new Intl.NumberFormat(localeInfo.name, omitEmpty({
      style: "percent",
      useGrouping: true,
      minimumFractionDigits: fractionDigits,
    })).format(value);
  }

  if (format[0].toLowerCase() == "w") {
    return numberToWords(value, locale);
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

Number.prototype.compareTo = function (other: number): number {
  return compareNumbers(this as number, other);
};

Number.prototype.format = function (format?: string, locale?: string): string {
  return formatNumber(this as number, format, locale);
};

Number.prototype.percent = function (percent: number): number {
  return calculatePercent(this as number, percent);
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

Number.prototype.toWords = function (locale?: string, options?: NumberToWordsOptions): string {
  return numberToWords(this as number, locale, options);
};

String.prototype.toInt = function (radix?: number): number {
  const value = parseInt(this as string, radix);
  if (typeof(value) !== "number" || isNaN(value)) throw new Error(`can not convert to integer: ${this}`);
  return value;
};

String.prototype.toFloat = function (): number {
  const value = parseFloat(this as string);
  if (typeof(value) !== "number" || isNaN(value)) throw new Error(`can not convert to number: ${this}`);
  return value;
};
