import {ValidationRule} from "@/validation";
import {isArray, isInteger, isNumber, isString, isUndefined} from "lodash-es";
import {isBetween} from "@/utils/num-utils";
import {Enum, isEnumDefined} from "@/utils/core-utils";

export function required(msg?: string): ValidationRule<any> {
  return {
    name: "required",
    message: msg ?? `{1:'value'} must not be empty`,
    ignoreUndefined: false,
    test(value: any): boolean | undefined {
      return !isUndefined(value);
    },
  };
}

export function matches(pattern: RegExp|string, msg?: string): ValidationRule<string> {
  if (isString(pattern)) pattern = new RegExp(`^${pattern}$`);
  return {
    name: "matches",
    message: msg ?? `{1:0} is not in the correct format`,
    test(value: string): boolean | undefined {
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
      return isString(value) && (exactLen ? value.length === min : isBetween(value.length, min, max as number, true));
    },
  };
}

export function minLen(min: number, msg?: string): ValidationRule<string> {
  return {
    name: "minLen",
    message: msg ?? `{1:0} length must be at least ${min}`,
    test(value: string): boolean | undefined {
      return isString(value) && (value.length >= min);
    },
  };
}

export function maxLen(max: number, msg?: string): ValidationRule<string> {
  return {
    name: "maxLen",
    message: msg ?? `{1:0} length must be ${max} or fewer`,
    test(value: string): boolean | undefined {
      return isString(value) && (value.length <= max);
    },
  };
}

export function digits(msg?: string): ValidationRule<string> {
  return {
    name: "digits",
    message: msg ?? `{1:0} must be contain digits only`,
    test(value: string): boolean | undefined {
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
      return isString(value) && pattern.test(value);
    },
  };
}

export function url(msg?: string): ValidationRule<string> {
  const pattern = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
  return {
    name: "url",
    message: msg ?? `{1:0} is not a valid url`,
    test(value: string): boolean | undefined {
      return isString(value) && pattern.test(value);
    },
  };
}

export function min(min: number, msg?: string): ValidationRule<number> {
  return {
    name: "min",
    message: msg ?? `{1:0} must be greater than or equal to ${min}`,
    test(value: number): boolean | undefined {
      return isNumber(value) && value >= min;
    },
  };
}

export function max(max: number, msg?: string): ValidationRule<number> {
  return {
    name: "max",
    message: msg ?? `{1:0} must be less than or equal to ${max}`,
    test(value: number): boolean | undefined {
      return isNumber(value) && value <= max;
    },
  };
}

export function lessThan(less: number, msg?: string): ValidationRule<number> {
  return {
    name: "lessThan",
    message: msg ?? `{1:0} must be less than ${less}`,
    test(value: number): boolean | undefined {
      return isNumber(value) && value < less;
    },
  };
}

export function greaterThan(greater: number, msg?: string): ValidationRule<number> {
  return {
    name: "greaterThan",
    message: msg ?? `{1:0} must be greater than ${greater}`,
    test(value: number): boolean | undefined {
      return isNumber(value) && value > greater;
    },
  };
}

export function integer(msg?: string): ValidationRule<number> {
  return {
    name: "integer",
    message: msg ?? `{1:0} must be an integer`,
    test(value: number): boolean | undefined {
      return isNumber(value) && isInteger(value);
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
      return isArray(value) && (exactSize ? value.length === min : isBetween(value.length, min, max as number, true));
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
