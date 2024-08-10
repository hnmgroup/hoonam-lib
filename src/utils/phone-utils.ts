import {isBlank} from "@/utils/string-utils";
import {getCurrentLocale} from "@/i18n";
import {Optional} from "@/utils/core-utils";
import {parsePhoneNumber} from "libphonenumber-js";

export function formatPhone(number: string, countryCode?: string, national = true): string {
  if (isBlank(number)) return number;

  countryCode ??= getCurrentLocale().country;

  const phone = parsePhoneNumber(number, countryCode?.toUpperCase() as any);

  if (!phone.isValid()) return "";

  return national ? phone.formatNational() : phone.formatInternational();
}

export function sanitizeMobile(number: string, countryCode?: string): Optional<string> {
  if (isBlank(number)) return undefined;

  countryCode ??= getCurrentLocale().country;

  const phone = parsePhoneNumber(number, countryCode?.toUpperCase() as any);

  if (!phone.isValid()) return undefined;

  return phone.number;
}

/* extensions */

String.prototype.formatPhone = function (countryCode?: string, national = true): string {
  return formatPhone(this as string, countryCode, national);
};

String.prototype.sanitizeMobile = function (countryCode?: string): Optional<string> {
  return sanitizeMobile(this as string, countryCode);
};
