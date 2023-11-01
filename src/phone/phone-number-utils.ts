import {isBlank} from "@/utils/string-utils";
import {resolve} from "@/provider.service";
import {I18nService} from "@/i18n.service";
import {App} from "vue";

export function formatPhoneNumber(phoneNumber: string): string {
  if (isBlank(phoneNumber)) return phoneNumber;

  const i18n = resolve<I18nService>(I18nService);

  if (phoneNumber.startsWith("+" + i18n.countryCallingCode))
    phoneNumber = "0" + phoneNumber.substring(i18n.countryCallingCode.length + 1);

  return phoneNumber;
}

export function registerPhoneGlobalProps(app: App): void {
  app.config.globalProperties.$phone = formatPhoneNumber;
}
