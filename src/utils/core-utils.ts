import {assign, each, isArray, isNaN, isNull, isObject, isString, isUndefined, keys, toNumber, has} from "lodash-es";
import {nonBlank} from "@/utils/string-utils";
import {AxiosError} from "axios";
import {GeoLocation} from "@/types/geo-location";
import {resolve} from "@/provider.service";
import {I18nService} from "@/i18n.service";
import {isNumeric} from "@/utils/num-utils";
import {isObservable, Observable} from "rxjs";

export const VOID: void = void(0);

export declare type Optional<T> = T | null | undefined;
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

export function invoke<T>(promise: Promise<T>|Observable<T>): void {
  isObservable(promise) ? promise.subscribe() : promise.then();
}

export function isNullOrUndefined(value: any): boolean {
  return isNull(value) || isUndefined(value);
}

export function isEmptyObject(obj: any): boolean {
  if (isNullOrUndefined(obj)) return true;
  if (isString(obj)) return obj === "";
  if (isArray(obj)) return (obj.length === 0 || obj.every(_ => isEmptyObject(_)));
  if (isObject(obj)) return isEmptyObject(keys(obj).map(_ => (obj as any)[_]));
  return false;
}

export function sanitizeDate(value: any): Optional<Date> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  const realValue: any = new Date(value);
  if (isNaN(realValue)) return undefined;
  return realValue;
}

export function sanitizeFile(value: any): Optional<File> {
  if (isNullOrUndefined(value)) return undefined;
  if (value === "") return undefined;
  return value instanceof File ? value : undefined;
}

export function reloadPage(): void {
  window.location.reload();
}

export interface ErrorBase {
  readonly message: string;
}

export class ApplicationError implements ErrorBase {
  readonly message: string;
  readonly error: any;

  constructor(error: any);
  constructor(message: string, error: any);
  constructor(messageOrError: any|string, error?: any) {
    this.message = isString(messageOrError) ? messageOrError : (messageOrError ?? error)?.message ?? "Error";
    this.error = !isString(messageOrError) ? messageOrError : error;
  }
}

export class ApiCallError implements ErrorBase {
  readonly message: string;
  readonly errors: Optional<ApiCallErrorDescriptor[]>;

  constructor(readonly error: any) {
    if (error instanceof AxiosError) {
      this.message = error.message;
      this.errors = error.response?.data?.errors ?? undefined;
    } else {
      this.message = undefined;
      this.errors = undefined;
    }
  }
}

export class WindowError implements ErrorBase {
  constructor(readonly error: any, readonly type: string, readonly message: string) {
  }
}

export interface ApiCallErrorDescriptor {
  errorType: string;
  message?: string;
  data?: StringMap;
  description?: string;
}

export class FieldError extends Error implements ErrorBase {
  readonly errors: Optional<ApiCallErrorDescriptor[]>;

  constructor(
    name: string,
    type: string,
    data: StringMap = {},
    message?: string,
    description?: string) {

    super(message);
    this.errors = [{
      errorType: type,
      data: assign({}, data, {
        fieldName: name
      }),
      message: message,
      description: description
    }];
  }
}

export class OperationState {
  static readonly Unknown = new OperationState("unknown")
  static readonly Processing = new OperationState("processing")
  static readonly Succeeded = new OperationState("succeeded")
  static readonly Failed = new OperationState("failed")

  private constructor(readonly name: "unknown"|"processing"|"succeeded"|"failed") {
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
    if (isAbsent(geoLocation)) reject(new ApplicationError("can't find geolocation service"));
    geoLocation.getCurrentPosition(
      (pos) => resolve(new GeoLocation(pos.coords.latitude, pos.coords.longitude)),
      (error) => reject(new ApplicationError(error)));
  });
}

export const DEFAULT_POSITION = new GeoLocation(29.61031, 52.53113);

export interface EnumItem<T> {
  readonly value: T;
  readonly name: string;
  readonly title: Optional<string>;
}

export type EnumInfo<T> = {[key: number|string]: EnumItem<T> } & { readonly entries: EnumItem<T>[]; };

export function getEnumInfo<T>(enumType: any, translateKeyPrefix: string): EnumInfo<T> {
  const i18n = resolve<I18nService>(I18nService);

  const result: any = {};

  // empty item
  result['_'] = {value: undefined, name: undefined, title: undefined} as EnumItem<T>;

  // enum items
  each(enumType, (value, key) => {
    const keyIsName = isNumeric(value);
    const enumValue = toNumber(keyIsName ? value : key);
    const enumName = keyIsName ? key : value;
    result[key] = {
      value: enumValue,
      name: enumName,
      title: i18n.translateLabel(`${translateKeyPrefix}.${enumName}`)
    } as EnumItem<T>;
  });

  // entries
  result.entries = keys(enumType)
    .filter(k => isNumeric(k))
    .map(value => ({
      value: toNumber(value),
      name: enumType[value],
      title: i18n.translateLabel(`${translateKeyPrefix}.${enumType[value]}`)
    }));

  return result;
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
