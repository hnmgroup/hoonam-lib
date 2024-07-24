import {VueI18n, createI18n} from "vue-i18n";
import { Configuration } from "@/configuration";
import fa from "@assets/i18n/fa/fa.json";

export class I18nService {

  private readonly _engine: any;
  private readonly _core: VueI18n;
  private _locale: string;
  private readonly _countryCallingCode = "98";

  get locale() { return this._locale; }
  get engine() { return this._engine; }
  get countryCallingCode() { return this._countryCallingCode; }

  constructor(configuration: Configuration) {
    this._locale = configuration.defaultLocale;
    this._engine = createI18n({
      locale: this._locale,
      fallbackLocale: "fa",
      messages: { fa },
      silentTranslationWarn: configuration.isProduction
    });
    this._core = this._engine.global;
  }

  translate(key: string, args?: object|any[]): string {
    return this._core.t(key, args as any);
  }

  translateLabel(key: string, args?: object|any[]): string {
    return this.translate(`labels.${key}`, args);
  }

  translateError(key: string, args?: object|any[]): string {
    return this.translate(`errors.${key}`, args);
  }

  setLocale(locale: string): void {
    this._core.locale = locale;
    this._locale = locale;
  }
}
