import {formatDigits, isBlank, sanitizeDigits} from "@/utils/string-utils";
import {Optional} from "@/utils/core-utils";
import {toInteger} from "@/utils/num-utils";
import {isUndefined, trimStart} from "lodash-es";

export function parseNationalCode(nationalCode: string): Optional<string> {
  nationalCode = sanitizeDigits(nationalCode?.trim());

  if (isBlank(nationalCode)) return undefined;
  if (!/^[0-9]{7,10}$/.test(nationalCode)) return undefined;

  nationalCode = nationalCode.padStart(10, '0');

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += toInteger(nationalCode[i]) * (10 - i);
  }
  const rem = sum % 11;
  const controlDigit = toInteger(nationalCode[9]);

  const isValid = rem < 2 ? controlDigit == rem : controlDigit == (11 - rem);

  return isValid ? nationalCode : undefined;
}

export function formatNationalCode(nationalCode: string, format?: string, locale?: string): string {
  if (isBlank(nationalCode)) return "";

  format ??= "s";
  const code = parseNationalCode(nationalCode);

  if (isUndefined(code)) return "";

  let result: string;
  switch (format[0].toLowerCase()) {
    case "s":
      return code;
    case "n":
      result = trimStart(code, "0");
      break;
    default:
      return "";
  }
  return formatDigits(result, locale);
}

export function toNationalCode(nationalCode: string, throwFailure = true): Optional<string> {
  if (isBlank(nationalCode)) return undefined;

  const code = parseNationalCode(nationalCode.trim());
  if (!isUndefined(code)) return code;

  if (throwFailure) throw new Error(`can't convert to national code: ${nationalCode}`);

  return undefined;
}

/* extensions */

String.prototype.formatNationalCode = function (format?: string, locale?: string): string {
  return formatNationalCode(this as string, format, locale);
};

String.prototype.toNationalCode = function (): Optional<string> {
  return toNationalCode(this as string);
};
