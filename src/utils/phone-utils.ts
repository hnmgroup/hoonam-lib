import {formatDigits, isBlank, sanitizeDigits} from "@/utils/string-utils";
import {getCurrentLocale, PERSIAN_LOCALE, resolveLocale} from "@/i18n";
import {isAbsent, Optional} from "@/utils/core-utils";
import {parsePhoneNumberWithError, isValidPhoneNumber} from "libphonenumber-js";

export function formatPhone(number: string, format?: string, locale?: string): string {
  if (isBlank(number)) return "";

  format ??= "n";
  const localeInfo = resolveLocale(locale);
  number = sanitizeDigits(number.trim());
  const phone = parsePhoneNumberWithError(number, localeInfo.country.toUpperCase() as any);

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

  const num =
    toMobile(number, countryCode, false) ??
    toTelephone(number, countryCode, false);
  if (num) return num;
  if (throwFailure) throw new Error(`can't convert to phone number: ${number}`);
  return undefined;
}

export function toMobile(number: string, countryCode?: string, throwFailure = true): Optional<string> {
  if (isBlank(number)) return undefined;

  const num = sanitizeDigits(number.trim());
  countryCode ??= getCurrentLocale().country;
  if (isValidPhoneNumber(num, countryCode.toUpperCase() as any)) {
    const phone = parsePhoneNumberWithError(
      num,
      countryCode.toUpperCase() as any,
    );

    let isValid = phone.isValid();
    if (isValid && countryCode == PERSIAN_LOCALE.country && !/^\+?0{0,2}98[0-9]{10,}/.test(phone.number)) {
      isValid = false;
    }

    if (isValid) {
      let type = phone.getType();

      if (isAbsent(type) && countryCode == PERSIAN_LOCALE.country && /^\+?0{0,2}989/.test(phone.number))
        type = "MOBILE";

      if (type == "MOBILE" || type == "FIXED_LINE_OR_MOBILE")
        return phone.number;
    }
  }

  if (throwFailure) throw new Error(`can't convert to mobile number: ${number}`);

  return undefined;
}

export function toTelephone(number: string, countryCode?: string, throwFailure = true): Optional<string> {
  if (isBlank(number)) return undefined;

  const num = sanitizeDigits(number.trim());
  countryCode ??= getCurrentLocale().country;
  if (isValidPhoneNumber(num, countryCode.toUpperCase() as any)) {
    const phone = parsePhoneNumberWithError(
      num,
      countryCode.toUpperCase() as any,
    );

    let isValid = phone.isValid();
    if (isValid && countryCode == PERSIAN_LOCALE.country && !/^\+?0{0,2}98[0-9]{10,}/.test(phone.number)) {
      isValid = false;
    }

    if (isValid) {
      let type = phone.getType();

      if (isAbsent(type) && countryCode == PERSIAN_LOCALE.country && /^\+?0{0,2}98[0-8]/.test(phone.number))
        type = "FIXED_LINE";

      if (type == "FIXED_LINE" || type == "FIXED_LINE_OR_MOBILE")
        return phone.number;
    }
  }

  if (throwFailure) throw new Error(`can't convert to telephone number: ${number}`);

  return undefined;
}

/* extensions */

String.prototype.formatPhone = function (format?: string, locale?: string): string {
  return formatPhone(this as string, format, locale);
};

String.prototype.toPhone = function (countryCode?: string): Optional<string> {
  return toPhone(this as string, countryCode);
};

String.prototype.toTelephone = function (countryCode?: string): Optional<string> {
  return toTelephone(this as string, countryCode);
};

String.prototype.toMobile = function (countryCode?: string): Optional<string> {
  return toMobile(this as string, countryCode);
};
