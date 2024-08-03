import {VueI18n, createI18n} from "vue-i18n";
import {Optional, StringMap} from "@/utils/core-utils";
import {has} from "lodash-es";
import { Options as AutoNumericOptions } from "autonumeric";

type NumericOptions = AutoNumericOptions & { altCurrencySymbol?: string; };

const SUPPORTED_LOCALES: StringMap<LocaleInfo> = {
  fa: {
    name: "fa",
    countryCallingCode: "98",
    timezone: "Asia/Tehran",
    zoneOffset: 210,
    numberFormats: {
      digitGroupSeparator: "،",
      decimalCharacter: "/",
      currencySymbol: " " + "ریال",
      altCurrencySymbol: " " + "تومان",
      currencySymbolPlacement: "s",
    },
  },
  en: {
    name: "en",
    numberFormats: {
      digitGroupSeparator: ",",
      decimalCharacter: ".",
      currencySymbol: "$" + " ",
      currencySymbolPlacement: "p",
    },
  }
};

const currentLocale = SUPPORTED_LOCALES["en"]; // TODO: check me...

export function getLocale(name: string): Optional<LocaleInfo> {
  return SUPPORTED_LOCALES[name];
}

export class I18n {
  readonly engine: any;
  private readonly _core: VueI18n;
  private _locale: LocaleInfo;

  get locale() { return this._locale; }

  constructor(locale: string, messages: StringMap, options?: I18nOptions) {
    if (!has(SUPPORTED_LOCALES, locale)) throw new Error(`invalid locale: ${locale}`);

    this._locale = SUPPORTED_LOCALES[locale];
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
    this._locale = SUPPORTED_LOCALES[locale];
  }
}

interface I18nOptions {
  silentTranslationWarn?: boolean;
}

interface LocaleInfo {
  name: string;
  countryCallingCode?: string;
  timezone?: string;
  zoneOffset?: number;
  numberFormats?: Partial<NumericOptions>;
}
