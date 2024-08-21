import {formatNumeric, isBlank, sanitizeNumeric} from "@/utils/string-utils";
import {getCurrentLocale, resolveLocale} from "@/i18n";
import {Optional} from "@/utils/core-utils";
import {parsePhoneNumber} from "libphonenumber-js";

export function formatPhone(number: string, national = true, locale?: string): string {
  if (isBlank(number)) return undefined;

  const localeInfo = resolveLocale(locale);
  number = sanitizeNumeric(number);
  const phone = parsePhoneNumber(number, localeInfo.country.toUpperCase() as any);

  if (!phone.isValid()) return "";

  return formatNumeric(national ? phone.formatNational() : phone.formatInternational());
}

export function sanitizeMobile(number: string, countryCode?: string): Optional<string> {
  if (isBlank(number)) return undefined;

  countryCode ??= getCurrentLocale().country;
  number = sanitizeNumeric(number);
  const phone = parsePhoneNumber(number, countryCode.toUpperCase() as any);

  return phone.isValid() ? phone.number : number;
}

export function isValidPhone(number: string, countryCode?: string): boolean {
  if (isBlank(number)) return false;

  countryCode ??= getCurrentLocale().country;
  number = sanitizeNumeric(number);
  const phone = parsePhoneNumber(number, countryCode.toUpperCase() as any);

  return phone.isValid();
}

/* extensions */

String.prototype.formatPhone = function (national = true, locale?: string): string {
  return formatPhone(this as string, national, locale);
};

String.prototype.sanitizeMobile = function (countryCode?: string): Optional<string> {
  return sanitizeMobile(this as string, countryCode);
};
