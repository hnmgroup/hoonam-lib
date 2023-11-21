import {computed, ComputedRef, ref, Ref} from "vue";
import {dispatcherInvoke, isAbsent, isPresent, Optional, StringMap} from "@/utils/core-utils";
import {Schema, ValidationError} from "yup";
import {Observable, Subject} from "rxjs";
import {isString} from "lodash-es";
import {WritableComputedRef} from "@vue/reactivity";

export class FormField<T = any, TFormatted = any> {
  protected _value: Ref<T>;
  protected _defaultValue: Optional<T>;
  protected readonly _validator: Optional<Schema<T>>;
  protected _errors: Ref<string[]>;
  private readonly _errorMessage: ComputedRef<Optional<string>>;
  private readonly _valid: ComputedRef<boolean>;
  private readonly _invalid: ComputedRef<boolean>;
  protected _dirty: Ref<boolean>;
  protected _pristine: Ref<boolean>;
  private readonly _dirtyAndInvalid: ComputedRef<boolean>;
  protected readonly _change = new Subject<T>();
  protected readonly _validateOnValueUpdate: boolean;
  private readonly _name: Ref<Optional<string>>;
  protected readonly _onReset: Optional<() => void>;
  private readonly _data = ref<StringMap>({});
  private _element: Optional<HTMLElement>;
  private readonly _alias: Optional<string>;
  private readonly _formattedValue?: WritableComputedRef<TFormatted>;
  readonly options: StringMap = {};

  get element() { return this._element; }
  set element(value: any) { this._element = value instanceof HTMLElement ? value : undefined; }

  get data() { return this._data.value; }

  get name() { return this._name.value; }
  set name(value: Optional<string>) { this._name.value = value; }

  get alias() { return this._alias; }

  get value() { return this._value.value; }
  set value(value: T) { this._setValue(value); }

  get formattedValue() { return this._formattedValue.value; }
  set formattedValue(value) { this._formattedValue.value = value; }

  get defaultValue() { return this._defaultValue; }

  get valid() { return this._valid.value; }
  get invalid() { return this._invalid.value; }
  get dirtyAndInvalid() { return this._dirtyAndInvalid.value; }

  get errorMessages(): string[] { return this._errors.value; }
  get errorMessage() { return this._errorMessage.value; }

  get pristine() { return this._pristine.value; }
  get dirty() { return this._dirty.value; }

  get change(): Observable<T> { return this._change; }

  constructor(name?: string);
  constructor(options?: Partial<FormFieldOptions<T, TFormatted>>);
  constructor(name: string, options: Partial<FormFieldOptions<T, TFormatted>>);
  constructor(nameOrOptions?: string | Partial<FormFieldOptions<T, TFormatted>>, pOptions?: Partial<FormFieldOptions<T, TFormatted>>) {
    const name = isString(nameOrOptions) ? nameOrOptions : undefined;
    const options = pOptions ?? (!isString(nameOrOptions) ? nameOrOptions : undefined);

    this._onReset = options?.onReset;
    this._name = isPresent(name) ? ref(name) as Ref<Optional<string>> : ref<Optional<string>>();
    this._alias = options?.alias;
    this._errors = ref<string[]>([]);
    this._validator = options?.validator;
    this._valid = computed<boolean>(() => this._errors.value.length == 0);
    this._invalid = computed<boolean>(() => !this._valid.value);
    this._errorMessage = computed<Optional<string>>(() => this._errors.value?.[0] ?? undefined);
    this._dirty = ref<boolean>(false);
    this._pristine = ref<boolean>(true);
    this._dirtyAndInvalid = computed<boolean>(() => this._dirty.value && this._invalid.value);
    this._defaultValue = options?.defaultValue;
    this._value = ref<T>(options?.defaultValue) as Ref<T>;
    this._validateOnValueUpdate = options?.validateOnValueUpdate ?? true;
    if ((options?.validateOnMount ?? false)) dispatcherInvoke(() => this.validate());
    this._formattedValue = computed<TFormatted>({
      get: () => {
        return isAbsent(this.value)
          ? this.value
          : (options?.formatter?.getter ?? ((value: any) => value))(this.value);
      },
      set: (value) => {
        this.value = isAbsent(value)
          ? value
          : (options?.formatter?.setter ?? ((value: any) => value))(value);
      }
    });
  }

  private _setValue(value: T, maskAsDirty = true): void {
    if (this._value.value === value) return;

    this._value.value = value;
    if (maskAsDirty) this.markAsDirty();
    this._change.next(value);
    if (this._validateOnValueUpdate) this.validate();
  }

  reset(): void {
    this._setValue(this._defaultValue, false);
    this._errors.value = [];
    this.markAsPristine();
    this._onReset?.();
  }

  markAsPristine(): void {
    this._dirty.value = false;
    this._pristine.value = true;
  }

  markAsDirty(): void {
    this._dirty.value = true;
    this._pristine.value = false;
  }

  addError(message: string): void {
    this._errors.value.push(message);
  }

  validate(): boolean {
    this._errors.value = [];
    let isValid = true;
    try { this._validator?.validateSync(this.value); }
    catch (error: any) {
      if (!(error instanceof ValidationError)) throw error;

      isValid = false;
      this._errors.value.push(error.message);
    }
    return isValid;
  }
}

export interface FormFieldOptions<T, TFormatted = any> {
  defaultValue?: T;
  validator?: Schema;
  validateOnValueUpdate: boolean;
  validateOnMount: boolean;
  onReset?: () => void;
  alias?: string;
  formatter?: {
    getter?: (value: T) => TFormatted;
    setter?: (value: TFormatted) => T;
  };
}
