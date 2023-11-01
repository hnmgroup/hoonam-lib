import AutoNumeric, { Options } from "autonumeric";
import { assign, toNumber, isNaN } from "lodash-es";
import { App } from "vue";
import {isAbsent, StringMap} from "@/utils/core-utils";
import { resolve } from "@/provider.service";
import { I18nService } from "@/i18n.service";

const localeOptions: StringMap<({altCurrencySymbol?: string} & Options)> = {
  fa: {
    digitGroupSeparator: '،',
    decimalCharacter: '/',
    currencySymbol: ' ' + 'ریال',
    altCurrencySymbol: ' ' + 'تومان',
    currencySymbolPlacement: 's'
  },
  en: {
    digitGroupSeparator: ',',
    decimalCharacter: '.',
    currencySymbol: '$' + ' ',
    currencySymbolPlacement: 'p'
  }
};

export function registerNumericGlobalProps(app: App): void {
  app.config.globalProperties.$nf = formatNumber;
}

export function formatNumber(value: number, currency: boolean = false): string {
  if (isAbsent(value) || isNaN(value)) return undefined;

  const locale = resolve<I18nService>(I18nService).currentLocale;
  const options = assign({}, AutoNumeric.getDefaultConfig(), <Options> {
    allowDecimalPadding: false
  }, localeOptions[locale]);

  if (!currency) {
    delete options.currencySymbol;
  }

  return AutoNumeric.format(toNumber(value), options);
}
