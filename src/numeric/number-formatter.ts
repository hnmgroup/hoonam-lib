import { App } from "vue";
import { resolve } from "@lib/provider";
import { I18nService } from "@lib/i18n.service";
import {isAbsent} from "@lib/utils/core-utils";

export function registerNumericGlobalProps(app: App): void {
  app.config.globalProperties.$nf = formatNumber;
}

export function formatNumber(value: number, currency: boolean = false): string {
  if (isAbsent(value) || isNaN(value)) return undefined;
  const locale = resolve(I18nService).locale;
  return value.format(locale, currency);
}
