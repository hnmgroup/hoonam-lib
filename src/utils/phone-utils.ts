import {formatDigits, isBlank, sanitizeDigits} from "@/utils/string-utils";
import {getCurrentLocale, resolveLocale} from "@/i18n";
import {Optional} from "@/utils/core-utils";
import {parsePhoneNumber} from "libphonenumber-js";

export function formatPhone(number: string, format?: string, locale?: string): string {
  if (isBlank(number)) return "";

  format ??= "n";
  const localeInfo = resolveLocale(locale);
  number = sanitizeDigits(number.trim());
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
  return formatDigits(result, locale);
}

export function toPhone(number: string, countryCode?: string, throwFailure = true): Optional<string> {
  if (isBlank(number)) return undefined;

  countryCode ??= getCurrentLocale().country;
  const phone = parsePhoneNumber(
    sanitizeDigits(number.trim()),
    countryCode.toUpperCase() as any,
  );
  if (phone.isValid()) return phone.number;

  if (throwFailure) throw new Error(`can't convert to phone number: ${number}`);

  return undefined;
}

/* extensions */

String.prototype.formatPhone = function (format?: string, locale?: string): string {
  return formatPhone(this as string, format, locale);
};

String.prototype.toPhone = function (countryCode?: string): Optional<string> {
  return toPhone(this as string, countryCode);
};
