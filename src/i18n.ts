import {VueI18n, createI18n} from "vue-i18n";
import {Optional, StringMap} from "@/utils/core-utils";
import {isUndefined, keys} from "lodash-es";

export interface Locale {
  readonly name: string;
  readonly country: string;
  readonly countryCode: string;
  readonly textInfo: {
    readonly isRTL: boolean;
  };
  readonly numberFormats: {
    readonly currencyCode: string;
    /** {value}: number value placeholder, {symbol}: currency symbol placeholder */
    readonly currencyFormat?: string;
    /** {value}: number value placeholder, {sign}: currency symbol placeholder */
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
    countryCode: "+1",
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
    countryCode: "+98",
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

  translate(key: string, args?: object | any[]): string {
    return this._core.t(key, args as any);
  }

  setLocale(locale: string): void {
    this._locale = getLocale(locale);
    this._core.locale = this._locale.name;
  }
}

interface I18nOptions {
  silentTranslationWarn?: boolean;
}
