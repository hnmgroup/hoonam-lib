import {VueI18n} from "vue-i18n";
import { Subject } from "rxjs";
import { Configuration } from "@/configuration";
import { createI18n } from "vue-i18n";
// import fa from "@assets/i18n/fa/fa.json";

export class I18nService {

  private readonly _engine: any;
  private readonly _core: VueI18n;
  private _currentLocale: string;
  private readonly _locale: Subject<string>;
  private readonly _countryCallingCode = "98";

  get locale() { return this._locale.asObservable(); }
  get currentLocale() { return this._currentLocale; }
  get engine() { return this._engine; }
  get countryCallingCode() { return this._countryCallingCode; }

  constructor(configuration: Configuration) {
    this._engine = createI18n({
      locale: configuration.defaultLocale,
      fallbackLocale: "fa",
      messages: { /* fa */ },
      silentTranslationWarn: configuration.isProduction
    });
    this._core = this._engine.global;
    this._locale = new Subject<string>();
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

  changeLocale(locale: string): void {
    this._core.locale = locale;
    this._currentLocale = locale;
    this._locale.next(locale);
  }

  setFarsiLocale(): void {
    this.changeLocale("fa");
  }

  setEnglishLocale(): void {
    this.changeLocale("en");
  }
}
