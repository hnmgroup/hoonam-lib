import { App } from "vue";
import { resolve } from "@/bind";
import { I18nService } from "@/i18n.service";
import {isAbsent} from "@/utils/core-utils";

export function registerNumericGlobalProps(app: App): void {
  app.config.globalProperties.$nf = formatNumber;
}

export function formatNumber(value: number, currency: boolean = false): string {
  if (isAbsent(value) || isNaN(value)) return undefined;
  const locale = resolve(I18nService).locale;
  return value.format(locale, currency);
}
