import {isBlank, isEmpty, sanitizeString} from "@/utils/string-utils";
import {resolve} from "@/bind";
import {I18n} from "@/i18n";
import {isAbsent, isPresent, notImplemented, Optional} from "@/utils/core-utils";
import {trimStart} from "lodash-es";
import {parsePhoneNumber, format} from "libphonenumber-js";

// TODO: use 'libphonenumber-js' library
export function formatPhone(number: string, countryCode?: string): string {
  if (isBlank(number)) return number;

  countryCode ??= resolve(I18n).locale.countryCallingCode;

  if (isPresent(countryCode) && number.startsWith("+" + countryCode)) {
    number = "0" + number.substring(countryCode.length + 1);
  }

  return number;
}

export function sanitizeMobile(number: string, countryCode?: string): Optional<string> {
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
