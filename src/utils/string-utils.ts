import { isString } from "lodash-es";
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

export function stringValueOf(value: any): string {
  if (isBlank(value)) return undefined;
  return value.trim();
}

export function insertAt(str: string, start: number, newStr: string): string {
  if (isNullOrUndefined(str) || isEmpty(newStr)) return str;
  const chars = str.split("");
  chars.splice(start, 0, ...newStr.split(""));
  return chars.join("");
}

export function sanitizeString(value: any, trim: boolean = true): Optional<string> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const realValue = String(value);
  if (trim && realValue.trim() === "") return undefined;
  return realValue;
}

export function sanitizeText(text: Optional<string>, arabicKafYa = true): Optional<string> {
  if (isBlank(text)) return undefined;

  return text.split('').map((char) => {
    const code = char.codePointAt(0);
    if (code >= 1632 && code <= 1641) return String.fromCodePoint(code - 1584);
    else if (code >= 1776 && code <= 1785) return String.fromCodePoint(code - 1728);
    else if (arabicKafYa && code == 1603) return String.fromCodePoint(1705);
    else if (arabicKafYa && code == 1610) return String.fromCodePoint(1740);
    else return char;
  }).join('');
}

export function sanitizeSlug(slug: string): string {
  if (isAbsent(slug)) return slug;
  return slug.trim().toLowerCase().replaceAll(" ", "-");
}

/* extensions methods */
declare global {
  interface String {
    startsWithIgnoreCase(searchString: string, position?: number): boolean;
    stripPrefix(str: string): string;
    stripSuffix(str: string): string;
    toInt(): Optional<number>;
    toFloat(): Optional<number>;
  }
}

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
