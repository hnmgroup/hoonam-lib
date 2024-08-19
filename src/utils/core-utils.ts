import {
  assign,
  each,
  isArray,
  isNaN,
  isNull,
  isObject,
  isString,
  isUndefined,
  has,
  values,
  isDate,
  omitBy,
  isEmpty as isEmptyValue,
  isNumber,
  set,
  isBoolean,
  toString
} from "lodash-es";
import {isBlank, isEmpty, nonBlank} from "@/utils/string-utils";
import {GeoLocation} from "@/utils/geo-location";
import {v4 as uuid} from "uuid";
import {Observable, Subject} from "rxjs";

export const VOID: void = void(0);

export declare type Optional<T> = T | undefined;
export declare type Nullable<T> = T | null;
export declare type StringMap<T = any> = {
  [key: string]: T;
};
export declare type IntegerMap<T = any> = {
  [key: number]: T;
};

export function isPresent(value: any): boolean { return !isNullOrUndefined(value); }
export function getOrElse<T>(value: T, ifAbsentValue: T): T { return isPresent(value) ? value : ifAbsentValue; }
export function isAbsent(value: any): boolean { return isNullOrUndefined(value); }
export function transform<T, R = void>(value: Optional<T>, action: (source: T) => R): R { return isPresent(value) ? action(value) : undefined; }
export function ifNonBlank<R = void>(value: Optional<string>, inspector: (source: string) => R): R { return nonBlank(value) ? inspector(value) : undefined; }

export function remove<T>(obj: T, property: keyof T, predicate?: (value: any, obj: T) => boolean): void {
  if (!has(obj, property)) return;
  if (isAbsent(predicate) || predicate(obj[property], obj)) delete obj[property];
}

export function noop<T = void>(arg?: T): T { return arg; }

export class Lazy<T> {
  private _value: T;
  private _initialized = false;

  constructor(private readonly valueProvider: () => T) {}

  get value(): T {
    if (!this._initialized) {
      this._value = this.valueProvider();
      this._initialized = true;
    }
    return this._value;
  }

  get initialized() { return this._initialized; }
}

export function dispatcherInvoke(action: Function, ...args: any[]): void {
  setTimeout(action, undefined, ...args);
}

export function isNullOrUndefined(value: any): boolean {
  return isNull(value) || isUndefined(value);
}

type EmptyObjectOptions = {
  /** treat blank string as empty */
  trim?: boolean;
  /** treat NaN number as empty */
  nan?: boolean;
  /** treat null as empty */
  null?: boolean;
};

export function isEmptyObject(value: any, options?: EmptyObjectOptions): boolean {
  options = assign(<EmptyObjectOptions> {trim: true, nan: true, null: true}, options);

  if (isUndefined(value)) return true;
  if (isNull(value)) return options.null;
  if (isString(value)) return value === "" || (options.trim && value.trim() === "");
  if (options.nan && isNaN(value)) return true;
  if (isDate(value)) return false;
  if (isArray(value)) return (value.length === 0 || value.every(_ => isEmptyObject(_, options)));
  if (isObject(value)) return values(value).every(_ => isEmptyObject(_, options));
  return false;
}

export function omitEmpty<T = any>(value: T, options?: EmptyObjectOptions): T {
  options = assign(<EmptyObjectOptions> {trim: true, nan: true, null: true}, options);

  if (isArray(value)) {
    const array = value.map(i => omitEmpty(i, options)).filter(i => !isEmptyObject(i, options));
    return array.length === 0 ? undefined : array as T;
  }

  if (isObject(value) && !isDate(value)) {
    const obj = omitBy(value, p => isEmptyObject(p, options));
    return isEmptyValue(obj) ? undefined : obj as T;
  }

  return isEmptyObject(value, options) ? undefined : value;
}

export function generateUniqueId(format = true): string {
  let id = uuid();
  if (format) id = id.replace(/-/g, '');
  return id;
}

export function reloadPage(hardReload?: boolean): void {
  if (hardReload) {
    if ("caches" in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name).then();
        });
      });
    }
    (window.location as any).reload(true);
  } else {
    window.location.reload();
  }
}

export class ErrorBase extends Error {
  readonly data: StringMap;

  constructor(message?: string, data?: StringMap, readonly cause?: any) {
    super(message);
    this.data = data ?? {};
  }
}

export class ApplicationError extends ErrorBase {
}

export class WindowError extends ErrorBase {
  constructor(error: any, readonly type: string, message: string) {
    super(message, undefined, error);
  }
}

export class NotImplementedError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? "missing implementation");
  }
}

/**
 * @throws {NotImplementedError}
 */
export function notImplemented(message?: string): never {
  throw new NotImplementedError(message);
}

export class OperationState {
  static readonly Unknown = new OperationState("unknown");
  static readonly Processing = new OperationState("processing");
  static readonly Succeeded = new OperationState("succeeded");
  static readonly Failed = new OperationState("failed");

  readonly isCompleted: boolean;

  private constructor(readonly name: "unknown"|"processing"|"succeeded"|"failed") {
    this.isCompleted = name == "succeeded" || name == "failed";
  }

  is(state: OperationState): boolean {
    return isPresent(state) && this.name === state.name;
  }
  isNot(state: OperationState): boolean {
    return isPresent(state) && this.name !== state.name;
  }
  complete(): OperationState {
    return this.name === "processing" ? OperationState.Succeeded : this;
  }
}

export function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    const geoLocation = navigator.geolocation;
    if (isAbsent(geoLocation))
      reject(new ApplicationError("can't find geolocation service"));
    else geoLocation.getCurrentPosition(
      (pos) => resolve(new GeoLocation(pos.coords.latitude, pos.coords.longitude)),
      (error) => reject(new ApplicationError(undefined, undefined, error))
    );
  });
}

export interface EnumItem<T> {
  readonly value: T;
  readonly name: string;
  readonly title: string;
}

export type Enum<T = any> = T extends {[P: string|number]: string|number} ? T : never;

export function isEnumType(obj: any): boolean {
  return typeof obj === "object"
    && obj !== null
    && Object.values(obj).every(value => typeof value === "number" || typeof value === "string");
}

export function getEnumValues(enumType: Enum): (number|string)[] {
  const enumValues = values(enumType);
  return getEnumUnderlyingType(enumType) == "number"
    ? enumValues.filter(isNumber)
    : enumValues;
}

export function isEnumDefined(enumType: Enum, value: any): boolean {
  const values = getEnumValues(enumType);
  return getEnumUnderlyingType(enumType) == "number"
    ? values.includes(parseFloat(value))
    : values.includes(toString(value));
}

export type EnumInfo<T> =
  { [P in keyof T]: EnumItem<T> } &
  { readonly _: EnumItem<undefined> } &
  { readonly entries: readonly EnumItem<T>[]; } &
  { of(item: T): EnumItem<T> };

function getEnumUnderlyingType(enumType: Enum): "number"|"string" {
  return values(enumType).some(isNumber) ? "number" : "string";
}

export function getEnumInfo<T>(enumType: Enum, titleResolver?: (name: string) => string): EnumInfo<T> {
  titleResolver ??= (name => name);
  const isNumericEnum = getEnumUnderlyingType(enumType) == "number";

  const result = {
    _: {value: undefined, name: undefined, title: undefined} as EnumItem<T>,
    entries: [] as EnumItem<T>[],
    of(item: Optional<T>): EnumItem<T> {
      return (this as any)[item ?? "_"];
    }
  };

  each(enumType, (value, name) => {
    if (isNumericEnum && !isNumber(value)) return;

    const entry: EnumItem<T> = {
      value,
      name,
      title: titleResolver(name),
    };
    result.entries.push(entry);
    set(result, entry.name, entry);
    set(result, entry.value as any, entry);
  });

  return result as EnumInfo<T>;
}

export class EventEmitter<T = void> extends Subject<T> {
  get event(): Event<T> { return this.asObservable(); }

  emit(value: T) {
    super.next(value);
  }
}

export class Event<T = void> extends Observable<T> {
}

export function loadScriptDynamically(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement("script");
      script.onload = () => resolve();
      script.type = "text/javascript";
      script.src = url;
      document.head.appendChild(script);
    } catch (error: any) {
      reject(error);
    }
  });
}

export function loadStyleDynamically(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement("link");
      link.onload = () => resolve();
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = url;
      document.head.appendChild(link);
    } catch (error: any) {
      reject(error);
    }
  });
}

export function downloadBlob(blob: Blob|string, fileName?: string): void {
  if (isEmpty(fileName)) fileName = generateUniqueId();
  else if (fileName.startsWith('.')) fileName = generateUniqueId() + fileName;

  const url = isString(blob) ? blob : window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);

  link.click();

  if (!isString(blob)) window.URL.revokeObjectURL(url);
  link.remove();
}

export function submitForm(url: string, data: StringMap): void {

  function serializeValue(value: any): string {
    if (isAbsent(value) || isNaN(value)) return "";
    if (isDate(value)) return value.toISOString();
    if (isBoolean(value)) return value ? "true" : "false";
    return String(value);
  }

  const form = document.createElement("form");
  form.style.display = "none";
  form.method = "post";
  form.action = url;
  form.name = "form_" + generateUniqueId();
  each(data, (value, name) => {
    if (isAbsent(value)) return;
    if (value === false) return;

    const elements: {
      id: string; name: string; value: string
    }[] = isArray(value)
      ? value.map((v, i) => ({
        id: form.name + '_' + name + '_' + i,
        name: name + '[' + i + ']',
        value: serializeValue(v),
      }))
      : [{
        id: form.name + '_' + name,
        name,
        value: serializeValue(value),
      }];

    elements.forEach(item => {
      const elem = document.createElement("input");
      elem.type = "hidden";
      elem.id = item.id;
      elem.name = item.name;
      elem.value = item.value;
      form.appendChild(elem);
    });
  });

  document.body.appendChild(form);
  form.submit();
}

export function sanitizeBoolean(value: any): Optional<boolean> {
  if (isBlank(value)) return undefined;
  if (value === true || value === 1 || "true".equals(value, true)) return true;
  if (value === false || value === 0 || "false".equals(value, true)) return false;
  return value;
}

/* extensions */

String.prototype.toBoolean = function (): boolean | undefined {
  const value = sanitizeBoolean(this as string);
  if (typeof(value) != "boolean") throw new Error(`can not convert to boolean: ${this}`);
  return value;
};
