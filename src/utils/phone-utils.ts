import {formatNumeric, isBlank, sanitizeNumeric} from "@/utils/string-utils";
import {getCurrentLocale, resolveLocale} from "@/i18n";
import {Optional} from "@/utils/core-utils";
import {parsePhoneNumber} from "libphonenumber-js";

export function formatPhone(number: string, format?: string, locale?: string): string {
  if (isBlank(number)) return undefined;

  format ??= "n";
  const localeInfo = resolveLocale(locale);
  number = sanitizeNumeric(number);
  const phone = parsePhoneNumber(number, localeInfo.country.toUpperCase() as any);

  if (!phone.isValid()) return "";

  let result: string;
  switch (format[0].toLowerCase()) {
    case "m":
      return phone.number;
    case "u":
      return phone.getURI();
    case "n":
      result = phone.formatNational();
      if (format[1]?.toLowerCase() == "s") result = result.replace(/\s/g, "");
      break;
    case "i":
      result = phone.formatInternational();
      if (format[1]?.toLowerCase() == "s") result = result.replace(/\s/g, "");
      break;
    default:
      return "";
  }
  return formatNumeric(result, locale);
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

String.prototype.formatPhone = function (format?: string, locale?: string): string {
  return formatPhone(this as string, format, locale);
};

String.prototype.sanitizeMobile = function (countryCode?: string): Optional<string> {
  return sanitizeMobile(this as string, countryCode);
};
