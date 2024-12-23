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
  isEmpty as _isEmpty,
  isNumber,
  isBoolean,
  toString,
  toNumber, omit as _omit
} from "lodash-es";
import {isEmpty, nonBlank, isBlank} from "@/utils/string-utils";
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

export type OrderDirection = "asc" | "desc";

export type ArrayIteratee<T, TResult = unknown> = (item: T, index: number, array: T[]) => TResult;
export type ValueIteratee<T, TResult = unknown> = (item: T) => TResult;
export type FieldOf<T, TProp = any> = {
  [Prop in keyof T]: T[Prop] extends TProp ? Prop : never
}[keyof T];
export type FieldOrValue<T, TProp = any> = FieldOf<T, TProp> | ValueIteratee<T, TProp>;

export type OneOrMore<T> = T | T[];

export function isPresent(value: any): boolean {
  return !isAbsent(value);
}

export function getOrElse<T>(value: T, ifAbsentValue: T): T {
  return isPresent(value) ? value : ifAbsentValue;
}

export function transform<T, R = void>(value: Optional<T>, action: (source: T) => R): R {
  return isPresent(value) ? action(value) : undefined;
}

export function ifNonBlank<R = void>(value: Optional<string>, inspector: (source: string) => R): R {
  return nonBlank(value) ? inspector(value) : undefined;
}

/** modify input obj */
export function remove<T>(obj: T, property: keyof T, predicate?: (value: any, obj: T) => boolean): void {
  if (!has(obj, property)) return;
  if (isAbsent(predicate) || predicate(obj[property], obj)) delete obj[property];
}

export function omit<T, P extends keyof T>(obj: T, property: P): Omit<T, P>;
export function omit<T, P1 extends keyof T, P2 extends keyof T>(obj: T, property1: P1, property2: P2): Omit<T, P1 | P2>;
export function omit<T, P1 extends keyof T, P2 extends keyof T, P3 extends keyof T>(obj: T, property1: P1, property2: P2, property3: P3): Omit<T, P1 | P2 | P3>;
export function omit<T, P1 extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T>(obj: T, property1: P1, property2: P2, property3: P3, property4: P4): Omit<T, P1 | P2 | P3 | P4>;
export function omit<T, P1 extends keyof T, P2 extends keyof T, P3 extends keyof T, P4 extends keyof T, P5 extends keyof T>(obj: T, property1: P1, property2: P2, property3: P3, property4: P4, property5: P5): Omit<T, P1 | P2 | P3 | P4 | P5>;
export function omit(obj: any, property1: string, property2?: string, property3?: string, property4?: string, property5?: string): any {
  const props = [property1, property2, property3, property4, property5].filter(name => !isUndefined(name));
  return props.reduce((obj, property) => _omit(obj, property), obj);
}

export function when<T = any>(condition: boolean, value: T, defaultValue?: T): T | undefined {
  return condition ? value : defaultValue;
}

export function unless<T = any>(condition: boolean, value: T, defaultValue?: T): T | undefined {
  return when(!condition, value, defaultValue);
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

export function isAbsent(value: any): value is null | undefined {
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
    return _isEmpty(obj) ? undefined : obj as T;
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

export type TEnum = {[P: string | number]: string | number};

export type Enum<T = any> = T extends TEnum ? T : never;

export class EnumItemInfo<T> {
  get title() { return this.titleResolver(); }

  constructor(
    readonly value: T,
    readonly name: string,
    private readonly titleResolver?: () => string,
  ) {
    this.titleResolver ??= () => this.name;
  }
}

export class EnumInfo<T extends number|string> {
  readonly entries: readonly EnumItemInfo<T>[];
  readonly underlyingType: "number" | "string";

  get values(): readonly T[] { return this.entries.map(entry => entry.value); }
  get names(): readonly string[] { return this.entries.map(entry => entry.name); }
  get titles(): readonly string[] { return this.entries.map(entry => entry.title); }

  constructor(enumType: Enum, titleResolver?: (name: string) => string) {
    if (!isEnumType(enumType)) {
      throw new Error(`invalid enum type: ${enumType}`);
    }

    this.underlyingType = getEnumUnderlyingType(enumType);

    const entries: EnumItemInfo<T>[] = [];
    const isNumericEnum = this.underlyingType == "number";
    each(enumType, (value, name) => {
      if (isNumericEnum && !isNumber(value)) return;

      const entry = new EnumItemInfo<T>(
        value,
        name,
        titleResolver ? () => titleResolver(name) : undefined,
      );
      entries.push(entry);
    });
    this.entries = entries;
  }

  isDefined(value: T): boolean {
    return this.underlyingType == "number"
      ? this.values.includes(toNumber(value as any) as any)
      : this.values.includes(toString(value) as any);
  }

  of(value: T): EnumItemInfo<T> {
    return this.entries.find(entry => entry.value == value);
  }

  nameOf(value: T): string {
    return this.of(value)?.name;
  }

  titleOf(value: T): string {
    return this.of(value)?.title;
  }
}

export function isEnumType(obj: any): boolean {
  return typeof obj === "object"
    && obj !== null
    && Object.values(obj).every(value => typeof value === "number" || typeof value === "string");
}

export function getEnumValues<T extends number|string = any>(enumType: Enum): readonly T[] {
  return enumInfo<T>(enumType).values;
}

export function isEnumDefined(enumType: Enum, value: any): boolean {
  return isEnumType(enumType) && enumInfo(enumType).isDefined(value);
}

export function getEnumUnderlyingType(enumType: Enum): "number"|"string" {
  return values(enumType).some(isNumber) ? "number" : "string";
}

export function enumInfo<T extends number|string>(
  enumType: Enum,
  titleResolver?: (name: string) => string,
): EnumInfo<T> {
  return new EnumInfo<T>(enumType, titleResolver);
}

export class EventEmitter<T> extends Subject<T> {
  get event(): Event<T> { return this.asObservable(); }

  emit(value: T): void {
    super.next(value);
  }
}

export interface Event<T> extends Observable<T> {
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

export function toBoolean(value: any, throwFailure = true): Optional<boolean> {
  if (isBlank(value)) return undefined;

  if (
    value === true ||
    value === 1 ||
    (isString(value) && value.trim().toLowerCase() == "true")
  ) return true;

  if (
    value === false ||
    value === 0 ||
    (isString(value) && value.trim().toLowerCase() == "false")
  ) return false;

  if (throwFailure) throw new Error(`can't convert to boolean: ${value}`);

  return undefined;
}

export function toEnum<T extends number|string>(enumType: Enum, value: any, throwFailure = true): Optional<T> {
  if (isBlank(value)) return undefined;

  const enumValue = getEnumValues(enumType).find(ev => ev == value);
  if (!isUndefined(enumValue)) return enumValue;

  if (throwFailure) throw new Error(`can't convert to enum (${enumType}): ${value}`);

  return undefined;
}

export function enumConv<T extends number|string>(enumType: Enum): (value: any, throwFailure?: boolean) => Optional<T> {
  return (value: any, throwFailure?: boolean) => toEnum(enumType, value, throwFailure);
}

/* extensions */

String.prototype.toBoolean = function (): boolean {
  return toBoolean(this);
};

String.prototype.toEnum = function <T extends string = string> (enumType: Enum): T {
  return toEnum(enumType, this);
};

Number.prototype.toEnum = function <T extends number = number> (enumType: Enum): T {
  return toEnum(enumType, this);
};
