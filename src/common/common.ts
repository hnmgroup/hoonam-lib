import { App } from "vue";
import { resolve } from "@/provider.service";
import {Configuration} from "@/configuration";
import {isPresent, isAbsent} from "@/utils/core-utils";
import {I18nService} from "@/i18n.service";

export function registerCommonGlobalProps(app: App): void {
  const config = resolve<Configuration>(Configuration);
  const i18n = resolve<I18nService>(I18nService);

  app.config.globalProperties.$prod = config.isProduction;
  app.config.globalProperties.$present = isPresent;
  app.config.globalProperties.$absent = isAbsent;
  app.config.globalProperties.$tl = i18n.translateLabel.bind(i18n);
}
