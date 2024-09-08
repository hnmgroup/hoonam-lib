import {get, isArray, isString, isUndefined, keys, trimEnd, trimStart} from "lodash-es";
import {isAbsent, Optional} from "@/utils/core-utils";
import {formatNumber} from "@/utils/num-utils";

export function isBlank(value: any): boolean {
  return isAbsent(value) || (isString(value) && value.trim().length == 0);
}

export function nonBlank(value: any): boolean {
  return !isBlank(value);
}

export function isEmpty(value: any): boolean {
  return isAbsent(value) || value === "";
}

export function nonEmpty(value: any): boolean {
  return !isAbsent(value) && (isString(value) && value !== "");
}

export function trim(value: any): Optional<string> {
  if (isBlank(value)) return undefined;
  return isString(value) ? value.trim() : value;
}

export function insertAt(str: string, start: number, newStr: string): string {
  if (isAbsent(str) || isEmpty(newStr)) return str;
  const chars = str.split("");
  chars.splice(start, 0, ...newStr.split(""));
  return chars.join("");
}

export function left(str: string, length: number): string {
  return length < str.length ? str.substring(0, length) : str;
}

export function right(str: string, length: number): string {
  return length < str.length ? str.substring(str.length - length) : str;
}

export function sanitizeDigits(str: string): string {
  if (isBlank(str)) return str;

  const NON_STANDARD_DIGITS_PATTERN = /[\u06F0-\u06F9\u0660-\u0669]/g;
  return str.replace(NON_STANDARD_DIGITS_PATTERN, (char) => {
    const code = char.codePointAt(0);
    if (code >= 0x06F0 && code <= 0x06F9) return String.fromCodePoint(code - 1728);
    else if (code >= 0x0660 && code <= 0x0669) return String.fromCodePoint(code - 1584);
    else return char;
  });
}

export function formatDigits(str: Optional<string>, locale?: string): Optional<string> {
  const DIGITS_PATTERN = /[0-9]/g;

  return sanitizeDigits(str)?.replace(DIGITS_PATTERN, (char) =>
    formatNumber(parseInt(char), "d", locale)
  );
}

export function formatString(str: string, args: object | any[]): string {
  const argValues = new Map<string, any>();
  isArray(args)
    ? args.forEach((value, index) => argValues.set(index.toString(), value))
    : keys(args).forEach(name => argValues.set(name, get(args, name)));
  return str?.replace(
    /(\\?)\{(\w+)((:(\w+|'.*'))*)}/gi,
    (raw: string, esc: Optional<string>, name: string, missingValue: Optional<string>) => {
      if (nonEmpty(esc)) return raw.substring(1);
      let value = argValues.get(name);
      if (isUndefined(value) && nonEmpty(missingValue)) {
        for (const part of missingValue.split(':')) {
          value = part.startsWith("'") ? part.substring(1, part.length - 1) : argValues.get(part);
          if (!isAbsent(value)) break;
        }
      }
      return (esc ?? "") + (value ?? "");
    }
  );
}

/* extensions */

String.prototype.startsWithIgnoreCase = function (searchString: string, position?: number): boolean {
  return this.toLowerCase().startsWith(searchString.toLowerCase(), position);
};

String.prototype.stripPrefix = function (str: string): string {
  return this.startsWith(str) ? this.substring(str.length) : this as string;
};

String.prototype.stripSuffix = function (str: string): string {
  return this.endsWith(str) ? this.substring(0, this.length - str.length) : this as string;
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

String.prototype.sanitizeDigits = function (): Optional<string> {
  return sanitizeDigits(this as string);
};

String.prototype.format = function (args: object | any[]): string {
  return formatString(this as string, args);
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

String.prototype.left = function (length: number): string {
  return left(this as string, length);
};

String.prototype.right = function (length: number): string {
  return right(this as string, length);
};

String.prototype.trims = function (): string | undefined {
  return trim(this as string);
};

String.prototype.trimStart = function (): string {
  return trimStart(this as string);
};

String.prototype.trimEnd = function (): string {
  return trimEnd(this as string);
};
