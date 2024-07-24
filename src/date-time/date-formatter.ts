import { App } from "vue";
import { toDateTimeString, toPersianFormat } from "./date-utils";
import { isAbsent } from "@/utils/core-utils";
import { resolve } from "@/provider";
import { I18nService } from "@/i18n.service";
import {isDate} from "lodash-es";

export function formatDate(value: Date, format?: string, locale?: string): string {
  if (isAbsent(value)) return undefined;

  if (!isDate(value)) value = new Date(value);

  locale ??= resolve(I18nService).locale;
  if (locale == "fa")
    return toPersianFormat(new Date(value), format ?? "yyyy/MM/dd");
  else
    return toDateTimeString(new Date(value), format ?? "yyyy-MM-dd");
}

export function registerDateGlobalProps(app: App): void {
  app.config.globalProperties.$dt = formatDate;
}
