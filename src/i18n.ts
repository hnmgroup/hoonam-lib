import {VueI18n, createI18n} from "vue-i18n";
import {Optional, StringMap} from "@/utils/core-utils";
import {has} from "lodash-es";

export interface Locale {
  readonly name: string;
  readonly country: string;
  readonly countryCallingCode: string;
  readonly timezone: string;
  readonly textInfo: {
    readonly isRTL: boolean;
  };
  readonly numberFormats: {
    readonly currency: string;
  };
}

const SUPPORTED_LOCALES: Locale[] = [
  {
    name: "en-US",
    country: "US",
    countryCallingCode: "+1",
    timezone: "America/New_York",
    textInfo: {
      isRTL: false,
    },
    numberFormats: {
      currency: "USD",
    },
  },
  {
    name: "fa-IR",
    country: "IR",
    countryCallingCode: "+98",
    timezone: "Asia/Tehran",
    textInfo: {
      isRTL: true,
    },
    numberFormats: {
      currency: "IRR",
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

export class I18n {
  readonly engine: any;
  private readonly _core: VueI18n;
  private _locale: Locale;

  get locale() { return this._locale; }

  constructor(locale: string, messages: StringMap, options?: I18nOptions) {
    if (!has(SUPPORTED_LOCALES, locale)) throw new Error(`invalid locale: ${locale}`);

    // this._locale = SUPPORTED_LOCALES[locale];
    this.engine = createI18n({
      locale: locale as any,
      messages,
      silentTranslationWarn: options?.silentTranslationWarn ?? false,
    });
    this._core = this.engine.global;
  }

  translate(key: string, args?: object | any[]): string {
    return this._core.t(key, args as any);
  }

  setLocale(locale: string): void {
    if (!has(SUPPORTED_LOCALES, locale)) throw new Error(`invalid locale: ${locale}`);

    this._core.locale = locale;
    // this._locale = SUPPORTED_LOCALES[locale];
  }
}

interface I18nOptions {
  silentTranslationWarn?: boolean;
}
