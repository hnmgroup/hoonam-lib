import {VueI18n, createI18n} from "vue-i18n";
import {Optional, StringMap} from "@/utils/core-utils";
import {isArray, isDate, isNumber, isUndefined, keys, mapValues} from "lodash-es";
import {resolve} from "@/bind";
import {formatNumber} from "@/utils/num-utils";
import {formatDate} from "@/utils/date-utils";

export interface Locale {
  readonly name: string;
  readonly country: string;
  readonly textInfo: {
    readonly isRTL: boolean;
  };
  readonly numberFormats: {
    readonly currencyCode: string;
    /** {value}: number value placeholder, {symbol}: currency symbol placeholder */
    readonly currencyFormat?: string;
    /** {value}: number value placeholder, {sign}: percent sign placeholder */
    readonly percentFormat?: string;
  };
  readonly dateTimeFormats: {
    readonly timezone: string;
  };
}

const SUPPORTED_LOCALES: Locale[] = [
  {
    name: "en-US",
    country: "US",
    textInfo: {
      isRTL: false,
    },
    numberFormats: {
      currencyCode: "USD",
    },
    dateTimeFormats: {
      timezone: "UTC",
    },
  },
  {
    name: "fa-IR",
    country: "IR",
    textInfo: {
      isRTL: true,
    },
    numberFormats: {
      currencyCode: "IRR",
      currencyFormat: "{value} {symbol}",
    },
    dateTimeFormats: {
      timezone: "Asia/Tehran",
    },
  },
];

export function getLocale(name: string, throwNotFound = true): Optional<Locale> {
  const locale = SUPPORTED_LOCALES.find(l => l.name == name);
  if (!locale && throwNotFound) throw new Error("invalid or not supported locale: " + name);
  return locale;
}

export const DEFAULT_LOCALE = getLocale("en-US");
export const PERSIAN_LOCALE = getLocale("fa-IR");
export const ENGLISH_LOCALE = getLocale("en-US");

let currentLocale = DEFAULT_LOCALE;

export function getCurrentLocale(): Locale {
  return currentLocale;
}

export function setCurrentLocale(locale: Locale): void {
  currentLocale = getLocale(locale.name);
}

export function resolveLocale(name?: string): Locale {
  if (name === null) return DEFAULT_LOCALE;
  if (isUndefined(name)) return getCurrentLocale();
  return getLocale(name);
}

export function resolveTimezone(timezone?: string): string {
  if (timezone === null) return DEFAULT_LOCALE.dateTimeFormats.timezone;
  if (isUndefined(timezone)) return getCurrentLocale().dateTimeFormats.timezone;
  return timezone;
}

export function getCurrencySymbol(locale?: string, symbol = true): Optional<string> {
  const localeInfo = resolveLocale(locale);
  const formatter = new Intl.NumberFormat(localeInfo.name, {
    style: "currency",
    currency: localeInfo.numberFormats.currencyCode,
    currencyDisplay: symbol ? "symbol" : "name",
  });

  const parts = formatter.formatToParts(0);
  const currency = parts.find(part => part.type === "currency");

  return currency?.value ?? undefined;
}

export function getPercentSymbol(locale?: string): Optional<string> {
  const localeInfo = resolveLocale(locale);
  const formatter = new Intl.NumberFormat(localeInfo.name, { style: "percent" });

  const parts = formatter.formatToParts(1);
  const sign = parts.find(part => part.type === "percentSign");

  return sign?.value ?? undefined;
}

export class I18n {
  readonly engine: any;
  private readonly _core: VueI18n;
  private _locale: Locale;

  get locale() { return this._locale; }

  constructor(locale: string, messages: StringMap, options?: I18nOptions) {
    if (keys(messages).some(ln => !SUPPORTED_LOCALES.some(l => l.name == ln)))
      throw new Error("invalid messages locale");

    this._locale = getLocale(locale);
    this.engine = createI18n({
      locale: this._locale.name,
      messages,
      silentTranslationWarn: options?.silentTranslationWarn ?? false,
    });
    this._core = this.engine.global;
  }

  translate(name: string, args?: object | any[]): string {

    function formatArg(value: any): any {
      return isNumber(value) ? formatNumber(value, "d") : isDate(value) ? formatDate(value) : value;
    }

    args = isArray(args) ? args.map(formatArg) : mapValues(args, formatArg);

    return this._core.t(name, args as any);
  }

  setLocale(locale: string): void {
    this._locale = getLocale(locale);
    this._core.locale = this._locale.name;
  }
}

interface I18nOptions {
  silentTranslationWarn?: boolean;
}

/* extensions */

String.prototype.translate = function (args?: object | any[]): string {
  return resolve(I18n).translate(this as string, args);
};
