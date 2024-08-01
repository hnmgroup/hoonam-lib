import {get, isArray, isString, isUndefined, keys} from "lodash-es";
import {isAbsent, isNullOrUndefined, Optional, sanitizeBoolean} from "@/utils/core-utils";
import {sanitizeFloat, sanitizeInteger} from "@/utils/num-utils";

export function isBlank(value: any): boolean {
  return isNullOrUndefined(value) || (isString(value) && value.trim() === '');
}

export function nonBlank(value: any): boolean {
  return !isBlank(value);
}

export function isEmpty(value: any): boolean {
  return isNullOrUndefined(value) || value === "";
}

export function nonEmpty(value: any): boolean {
  return !isNullOrUndefined(value) && (isString(value) && value !== "");
}

export function trim(value: string): string {
  if (isBlank(value)) return undefined;
  return value.trim();
}

export function insertAt(str: string, start: number, newStr: string): string {
  if (isNullOrUndefined(str) || isEmpty(newStr)) return str;
  const chars = str.split("");
  chars.splice(start, 0, ...newStr.split(""));
  return chars.join("");
}

export function sanitizeString(
  str: Optional<string>,
  options?: { trim?: boolean; persianNumbers?: boolean; arabicNumbers?: boolean; arabicLetters?: boolean; },
): Optional<string> {
  if ((options?.trim ?? true) && isString(str)) str = str.trim();
  if (isEmpty(str)) return undefined;

  const patternText =
    options?.persianNumbers ? "\u06F0-\u06F9" : "" +
    options?.arabicNumbers ? "\u0660-\u0669" : "" +
    options?.arabicLetters ? "\u0643\u064A" : "";

  if (patternText.length == 0) return str;

  const pattern = new RegExp("[" + patternText + "]", "g");
  return str.replace(pattern, (char) => {
    const code = char.codePointAt(0);
    if (code >= 0x06F0 && code <= 0x06F9) return String.fromCodePoint(code - 1728);
    else if (code >= 0x0660 && code <= 0x0669) return String.fromCodePoint(code - 1584);
    else if (code == 0x0643) return "\u06A9";
    else if (code == 0x064A) return "\u06CC";
    else return char;
  });
}

export function sanitizeSlug(slug: string): string {
  if (isAbsent(slug)) return slug;
  return slug.trim().toLowerCase().replace(/\s/g, '-');
}

export function format(str: string, args: object | any[]): string {
  const argValues = new Map<string, any>();
  isArray(args)
    ? args.forEach((value, index) => argValues.set(index.toString(), value))
    : keys(args).forEach(name => argValues.set(name, get(args, name)));
  return str?.replace(
    /(.?)\{(\w+)((:(\w+|'.*'))*)}/gi,
    (raw: string, prefix: Optional<string>, name: string, missingValue?: string) => {
      if (prefix == '\\') return raw.substring(1);
      let value = argValues.get(name);
      if (isUndefined(value) && nonEmpty(missingValue)) {
        for (const part of missingValue.split(':')) {
          value = part.startsWith("'") ? part.substring(1, part.length - 1) : argValues.get(part);
          if (!isNullOrUndefined(value)) break;
        }
      }
      return (prefix ?? "") + (value ?? "");
    }
  );
}

/* extensions */
import "./string-utils.d";

String.prototype.toDateTime = function (): Optional<Date> {
  if (isEmpty(this)) return undefined;
  return new Date(this as string);
};

String.prototype.startsWithIgnoreCase = function (searchString: string, position?: number): boolean {
  return this.toLowerCase().startsWith(searchString.toLowerCase(), position);
};

String.prototype.stripPrefix = function (str: string): string {
  return this.startsWith(str) ? this.substring(str.length) : this as string;
};

String.prototype.stripSuffix = function (str: string): string {
  return this.endsWith(str) ? this.substring(0, this.length - str.length) : this as string;
};

String.prototype.toInt = function (): Optional<number> {
  return sanitizeInteger(this);
};

String.prototype.toFloat = function (): Optional<number> {
  return sanitizeFloat(this);
};

String.prototype.toChars = function (): string[] {
  return this?.split('');
};

String.prototype.equals = function (other: Optional<string>, ignoreCase = false): boolean {
  if (!isString(other)) return false;
  return ignoreCase
    ? this?.toLowerCase() === other?.toLowerCase()
    : this === other;
};

String.prototype.sanitize = function (
  options?: { trim?: boolean; persianNumbers?: boolean; arabicNumbers?: boolean; arabicLetters?: boolean; }
): Optional<string> {
  return sanitizeString(this as string, options);
};

String.prototype.format = function (args: object | any[]): string {
  return format(this as string, args);
};

String.prototype.isBlank = function (): boolean {
  return isBlank(this);
};

String.prototype.nonBlank = function (): boolean {
  return nonBlank(this);
};

String.prototype.isEmpty = function (): boolean {
  return isEmpty(this);
};

String.prototype.nonEmpty = function (): boolean {
  return nonEmpty(this);
};

String.prototype.insert = function (start: number, newStr: string): string {
  return insertAt(this as string, start, newStr);
};

String.prototype.trims = function (): string | undefined {
  return trim(this as string);
};

String.prototype.toBoolean = function (): boolean | undefined {
  return sanitizeBoolean(this as string);
};
