import {ValidationRule} from "./validator";
import {isArray, isBoolean, isDate, isInteger, isNaN, isNumber, isString, isUndefined} from "lodash-es";
import {isBetween, toInteger, toNumber} from "@/utils/num-utils";
import {compareDates, formatDate, toDate} from "@/utils/date-utils";
import {Enum, isEmptyObject, isEnumDefined, toBoolean} from "@/utils/core-utils";
import {sanitizeDigits} from "@/utils/string-utils";
import {toMobile, toPhone, toTelephone} from "@/utils/phone-utils";

function prepareString(value: any): any {
  return isString(value) ? sanitizeDigits(value.trim()) : value;
}

export function required(msg?: string): ValidationRule<any> {
  return {
    name: "required",
    message: msg ?? `{1:'value'} must not be empty`,
    ignoreUndefined: false,
    test(value: any): boolean | undefined {
      return !isEmptyObject(value);
    },
  };
}

export function matches(pattern: RegExp|string, msg?: string): ValidationRule<string> {
  if (isString(pattern)) pattern = new RegExp(`^${pattern}$`);
  return {
    name: "matches",
    message: msg ?? `{1:0} is not in the correct format`,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && (pattern as RegExp).test(value);
    },
  };
}

export function len(len: number): ValidationRule<string>;
export function len(len: number, msg: string): ValidationRule<string>;
export function len(min: number, max: number): ValidationRule<string>;
export function len(min: number, max: number, msg: string): ValidationRule<string>;
export function len(min: number, max?: number|string, msg?: string): ValidationRule<string> {
  if (isString(max)) {
    msg = max;
    max = undefined;
  }
  const exactLen = isUndefined(max);

  const message = msg ?? (exactLen
    ? `{1:0} length must be ${min}`
    : `{1:0} length must be between ${min} and ${max}`);
  return {
    name: "len",
    message,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && (
        exactLen ? value.length === min : isBetween(value.length, min, max as number, true)
      );
    },
  };
}

export function minLen(min: number, msg?: string): ValidationRule<string> {
  return {
    name: "minLen",
    message: msg ?? `{1:0} length must be at least ${min}`,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && (value.length >= min);
    },
  };
}

export function maxLen(max: number, msg?: string): ValidationRule<string> {
  return {
    name: "maxLen",
    message: msg ?? `{1:0} length must be ${max} or fewer`,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && (value.length <= max);
    },
  };
}

export function digitOnly(msg?: string): ValidationRule<string> {
  return {
    name: "digitOnly",
    message: msg ?? `{1:0} must be contain digits only`,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && /^\d*$/.test(value);
    },
  };
}

export function email(msg?: string): ValidationRule<string> {
  const pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return {
    name: "email",
    message: msg ?? `{1:0} is not a valid email address`,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && pattern.test(value);
    },
  };
}

export function url(msg?: string): ValidationRule<string> {
  const pattern = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i;
  return {
    name: "url",
    message: msg ?? `{1:0} is not a valid url`,
    test(value: string): boolean | undefined {
      value = prepareString(value);
      return isString(value) && pattern.test(value);
    },
  };
}

export function min(min: number|Date, msg?: string): ValidationRule<number|Date> {
  const msgValue = min instanceof Date ? formatDate(min) : min;
  return {
    name: "min",
    message: msg ?? `{1:0} must be greater than or equal to ${msgValue}`,
    test(value: number|Date): boolean | undefined {
      value = isNumber(value) ? toNumber(value, false) : toDate(value, false);
      return (isNumber(value) && value >= min) || (isDate(value) && compareDates(value, min as Date) >= 0);
    },
  };
}

export function max(max: number|Date, msg?: string): ValidationRule<number|Date> {
  const msgValue = max instanceof Date ? formatDate(max) : max;
  return {
    name: "max",
    message: msg ?? `{1:0} must be less than or equal to ${msgValue}`,
    test(value: number|Date): boolean | undefined {
      value = isNumber(value) ? toNumber(value, false) : toDate(value, false);
      return (isNumber(value) && value <= max) || (isDate(value) && compareDates(value, max as Date) <= 0);
    },
  };
}

export function lessThan(less: number|Date, msg?: string): ValidationRule<number|Date> {
  const msgValue = less instanceof Date ? formatDate(less) : less;
  return {
    name: "lessThan",
    message: msg ?? `{1:0} must be less than ${msgValue}`,
    test(value: number|Date): boolean | undefined {
      value = isNumber(value) ? toNumber(value, false) : toDate(value, false);
      return (isNumber(value) && value < less) || (isDate(value) && compareDates(value, less as Date) < 0);
    },
  };
}

export function greaterThan(greater: number|Date, msg?: string): ValidationRule<number|Date> {
  const msgValue = greater instanceof Date ? formatDate(greater) : greater;
  return {
    name: "greaterThan",
    message: msg ?? `{1:0} must be greater than ${msgValue}`,
    test(value: number|Date): boolean | undefined {
      value = isNumber(value) ? toNumber(value, false) : toDate(value, false);
      return (isNumber(value) && value > greater) || (isDate(value) && compareDates(value, greater as Date) > 0);
    },
  };
}

export function digits(digit: number): ValidationRule<number>;
export function digits(digit: number, msg: string): ValidationRule<number>;
export function digits(min: number, max: number): ValidationRule<number>;
export function digits(min: number, max: number, msg: string): ValidationRule<number>;
export function digits(min: number, max?: number|string, msg?: string): ValidationRule<number> {
  if (isString(max)) {
    msg = max;
    max = undefined;
  }
  const exactDigit = isUndefined(max);

  const message = msg ?? (exactDigit
    ? `{1:0} digits must be ${min}`
    : `{1:0} digits must be between ${min} and ${max}`);
  return {
    name: "digits",
    message,
    test(value: number): boolean | undefined {
      value = toNumber(value, false);
      return isNumber(value) && (
        exactDigit ? value.toString().length === min : isBetween(value.toString().length, min, max as number)
      );
    },
  };
}

export function size(size: number): ValidationRule<any[]>;
export function size(size: number, msg: string): ValidationRule<any[]>;
export function size(min: number, max: number): ValidationRule<any[]>;
export function size(min: number, max: number, msg: string): ValidationRule<any[]>;
export function size(min: number, max?: number|string, msg?: string): ValidationRule<any[]> {
  if (isString(max)) {
    msg = max;
    max = undefined;
  }
  const exactSize = isUndefined(max);

  const message = msg ?? (exactSize
    ? `{1:0} size must be ${min}`
    : `{1:0} size must be between ${min} and ${max}`);
  return {
    name: "size",
    message,
    test(value: any[]): boolean | undefined {
      return isArray(value) && (
        exactSize ? value.length === min : isBetween(value.length, min, max as number)
      );
    },
  };
}

export function minSize(min: number, msg?: string): ValidationRule<any[]> {
  return {
    name: "minSize",
    message: msg ?? `{1:0} size must be at least ${min}`,
    test(value: any[]): boolean | undefined {
      return isArray(value) && (value.length >= min);
    },
  };
}

export function maxSize(max: number, msg?: string): ValidationRule<any[]> {
  return {
    name: "maxSize",
    message: msg ?? `{1:0} size must be ${max} or fewer`,
    test(value: any[]): boolean | undefined {
      return isArray(value) && (value.length <= max);
    },
  };
}

export function oneOf<T>(values: T[], msg?: string): ValidationRule<T> {
  return {
    name: "oneOf",
    message: msg ?? `{1:0} is not in the range of valid values`,
    test(value: T): boolean | undefined {
      return values.includes(value);
    },
  };
}

export function noneOf<T>(values: T[], msg?: string): ValidationRule<T> {
  return {
    name: "noneOf",
    message: msg ?? `{1:0} is not in the range of valid values`,
    test(value: T): boolean | undefined {
      return !values.includes(value);
    },
  };
}

export function isEnum<T extends string|number>(type: Enum, msg?: string): ValidationRule<T> {
  return {
    name: "enum",
    message: msg ?? `{1:0} is not in the range of valid values`,
    test(value: number|string): boolean | undefined {
      return isEnumDefined(type, value);
    },
  };
}

export function integer(msg?: string): ValidationRule<number> {
  return {
    name: "integer",
    message: msg ?? `{1:0} must be an integer`,
    test(value: number): boolean | undefined {
      value = toInteger(value, undefined, false);
      return isNumber(value) && !isNaN(value) && isInteger(value);
    },
  };
}

export function phone(countryCode?: string, msg?: string): ValidationRule<string> {
  return {
    name: "phone",
    message: msg ?? `{1:0} must be a valid phone number`,
    test(value: string): boolean | undefined {
      return !!toPhone(value, countryCode, false);
    },
  };
}

export function mobile(countryCode?: string, msg?: string): ValidationRule<string> {
  return {
    name: "phone",
    message: msg ?? `{1:0} must be a valid phone number`,
    test(value: string): boolean | undefined {
      return !!toMobile(value, countryCode, false);
    },
  };
}

export function telephone(countryCode?: string, msg?: string): ValidationRule<string> {
  return {
    name: "phone",
    message: msg ?? `{1:0} must be a valid phone number`,
    test(value: string): boolean | undefined {
      return !!toTelephone(value, countryCode, false);
    },
  };
}

export function number(msg?: string): ValidationRule<number> {
  return {
    name: "number",
    message: msg ?? `{1:0} must be a number`,
    test(value: number): boolean | undefined {
      value = toNumber(value, false);
      return isNumber(value) && !isNaN(value);
    },
  };
}

export function date(msg?: string): ValidationRule<Date> {
  return {
    name: "date",
    message: msg ?? `{1:0} must be a date`,
    test(value: Date): boolean | undefined {
      value = toDate(value, false);
      return isDate(value);
    },
  };
}

export function boolean(msg?: string): ValidationRule<boolean> {
  return {
    name: "boolean",
    message: msg ?? `{1:0} must be true or false`,
    test(value: boolean): boolean | undefined {
      value = toBoolean(value, false);
      return isBoolean(value);
    },
  };
}
