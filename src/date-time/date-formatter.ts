import { App } from "vue";
import { toDateTimeString, toPersianFormat } from "./date-utils";
import { isAbsent } from "@/utils/core-utils";
import { resolve } from "@/bind";
import { I18n } from "@/i18n";
import {isDate} from "lodash-es";

export function formatDate(value: Date, format?: string, locale?: string): string {
  if (isAbsent(value)) return undefined;

  if (!isDate(value)) value = new Date(value);

  locale ??= resolve(I18n).locale.name;
  if (locale == "fa")
    return toPersianFormat(new Date(value), format ?? "yyyy/MM/dd");
  else
    return toDateTimeString(new Date(value), format ?? "yyyy-MM-dd");
}

export function registerDateGlobalProps(app: App): void {
  app.config.globalProperties.$dt = formatDate;
}
