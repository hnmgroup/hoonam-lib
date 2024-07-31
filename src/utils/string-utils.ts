import {get, isArray, isString, isUndefined, keys} from "lodash-es";
import {isAbsent, isNullOrUndefined, Optional} from "@/utils/core-utils";
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

const _trim = trim;
export function sanitizeString(str: Optional<string>, trim: boolean = true, arabicKafYa = true): Optional<string> {
  if (!isString(str)) return undefined;
  str = trim ? _trim(str) : (isEmpty(str) ? undefined : str);
  return !isUndefined(str) && arabicKafYa ? str.toChars().reduce((str, char) => {
    const code = char.codePointAt(0);

    // persian native numbers
    if (code >= 1776 && code <= 1785) return str + String.fromCodePoint(code - 1728);

    // arabic native numbers
    else if (code >= 1632 && code <= 1641) return str + String.fromCodePoint(code - 1584);
    // arabic kaf/ya
    else if (arabicKafYa && code == 1603) return str + String.fromCodePoint(1705);
    else if (arabicKafYa && code == 1610) return str + String.fromCodePoint(1740);

    else return str + char;
  }, "") : str;
}

export function sanitizeSlug(slug: string): string {
  if (isAbsent(slug)) return slug;
  return slug.trim().toLowerCase().replace(/\s/g, '-');
}

export function format(str: string, args: object|any[]): string {
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

/* extensions methods */
export {}
declare global {
  interface String {
    startsWithIgnoreCase(searchString: string, position?: number): boolean;
    stripPrefix(str: string): string;
    stripSuffix(str: string): string;
    toChars(): string[];
    toInt(): Optional<number>;
    toFloat(): Optional<number>;
    toDateTime(): Optional<Date>;
    equals(other: Optional<string>, ignoreCase?: boolean): boolean;
    sanitize(trim?: boolean, arabicKafYa?: boolean): Optional<string>;
    format(args: object|any[]): string;
  }
}

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

String.prototype.sanitize = function (trim = true, arabicKafYa = true): Optional<string> {
  return sanitizeString(this as string, trim, arabicKafYa);
};

String.prototype.format = function (args: object|any[]): string {
  return format(this as string, args);
};
