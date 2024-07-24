import {isBlank, isEmpty, sanitizeString} from "@/utils/string-utils";
import {resolve} from "@/provider";
import {I18nService} from "@/i18n.service";
import {App} from "vue";
import {isAbsent, isPresent, Optional} from "@lib/utils/core-utils";
import {trimStart} from "lodash-es";

export function formatPhoneNumber(phoneNumber: string): string {
  if (isBlank(phoneNumber)) return phoneNumber;

  const i18n = resolve(I18nService);

  if (phoneNumber.startsWith("+" + i18n.countryCallingCode))
    phoneNumber = "0" + phoneNumber.substring(i18n.countryCallingCode.length + 1);

  return phoneNumber;
}

export function registerPhoneGlobalProps(app: App): void {
  app.config.globalProperties.$phone = formatPhoneNumber;
}

export function validateMobileNumber(number: string, countryCode?: string): Optional<string> {
  number = sanitizeString(number);
  if (isPresent(countryCode)) countryCode = sanitizeString(countryCode);

  countryCode ??= resolve(I18nService).countryCallingCode;
  number = number?.sanitize();

  if (isEmpty(number)) return undefined;

  number = trimStart(number, "+0");

  const matches = /^(?<country>[0-9]{0,3})?(?<number>[0-9]{10})$/.exec(number);

  if (isAbsent(matches)) return undefined;

  number = matches.groups["number"];
  countryCode = matches.groups["country"]?.sanitize() ?? countryCode;

  return '+' + countryCode + number;
}
