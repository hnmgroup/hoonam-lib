import { App } from "vue";
import { resolve } from "@/provider";
import {Configuration} from "@/configuration";
import {isPresent, isAbsent, transform} from "@/utils/core-utils";
import {I18nService} from "@/i18n.service";

export function registerCommonGlobalProps(app: App): void {
  const config = resolve(Configuration);
  const i18n = resolve(I18nService);

  app.config.globalProperties.$prod = config.isProduction;
  app.config.globalProperties.$present = isPresent;
  app.config.globalProperties.$absent = isAbsent;
  app.config.globalProperties.$tl = i18n.translateLabel.bind(i18n);
  app.config.globalProperties.$inpVal = (element: any) =>
    transform(element, (e: HTMLInputElement) => (e.type == "checkbox" ? e.checked : e.value) as any);
  app.config.globalProperties.$setVal = (element: any, value: any) =>
    transform(element, (e: HTMLInputElement) => e.value == value);
  app.config.globalProperties.$elBlur = (element: any) =>
    transform(element, (e: HTMLElement) => e.blur());
}
