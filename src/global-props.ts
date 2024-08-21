import { App } from "vue";
import { resolve } from "@/bind";
import {Configuration} from "@/configuration";
import {isPresent, isAbsent, transform} from "@/utils/core-utils";
import {I18n} from "@/i18n";

export function registerGlobalProps(app: App): void {
  const config = resolve(Configuration);
  const i18n = resolve(I18n);

  app.config.globalProperties.$prod = config.isProduction;
  app.config.globalProperties.$present = isPresent;
  app.config.globalProperties.$absent = isAbsent;
  app.config.globalProperties.$inpVal = (element: any) =>
    transform(element, (e: HTMLInputElement) => (e.type == "checkbox" ? e.checked : e.value) as any);
  app.config.globalProperties.$setVal = (element: any, value: any) =>
    transform(element, (e: HTMLInputElement) => e.value == value);
  app.config.globalProperties.$elBlur = (element: any) =>
    transform(element, (e: HTMLElement) => e.blur());
  app.config.globalProperties.$tr = (name: string, args?: object | any[]) =>
    i18n.translate(name, args);
}
