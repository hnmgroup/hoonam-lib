import {isBlank, isEmpty, sanitizeString} from "@/utils/string-utils";
import {resolve} from "@/bind";
import {I18n} from "@/i18n";
import {App} from "vue";
import {isAbsent, isPresent, Optional} from "@/utils/core-utils";
import {trimStart} from "lodash-es";

export function formatPhoneNumber(phoneNumber: string): string {
  if (isBlank(phoneNumber)) return phoneNumber;

  const i18n = resolve(I18n);

  if (
    isPresent(i18n.locale.countryCallingCode) &&
    phoneNumber.startsWith("+" + i18n.locale.countryCallingCode)
  ) {
    phoneNumber = "0" + phoneNumber.substring(i18n.locale.countryCallingCode.length + 1);
  }

  return phoneNumber;
}

export function registerPhoneGlobalProps(app: App): void {
  app.config.globalProperties.$phone = formatPhoneNumber;
}

export function validateMobileNumber(number: string, countryCode?: string): Optional<string> {
  number = sanitizeString(number);
  if (isPresent(countryCode)) countryCode = sanitizeString(countryCode);

  countryCode ??= resolve(I18n).locale.countryCallingCode;
  number = sanitizeString(number);

  if (isEmpty(number)) return undefined;

  number = trimStart(number, "+0");

  const matches = /^(?<country>[0-9]{0,3})?(?<number>[0-9]{10})$/.exec(number);

  if (isAbsent(matches)) return undefined;

  number = matches.groups["number"];
  countryCode = sanitizeString(matches.groups["country"]) ?? countryCode;

  return !isBlank(countryCode) ? '+' + countryCode + number : number;
}
