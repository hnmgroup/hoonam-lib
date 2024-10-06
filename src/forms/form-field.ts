import {shallowRef, ShallowRef} from "vue";
import {Optional, isAbsent, StringMap} from "@/utils/core-utils";
import {PrimitiveField, FormFieldOptions} from "./forms-types";
import {AbstractFormField} from "./abstract-form-field";
import {assign, isString} from "lodash-es";
import {trim} from "@/utils/string-utils";

export class FormField<
  T extends PrimitiveField,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
> extends AbstractFormField<T, TData, TOptions> {
  private readonly _value: ShallowRef<T>;
  readonly defaultValue: Optional<T>;

  constructor(options?: FormFieldOptions<T>) {
    super(options);
    this.defaultValue = options?.defaultValue;
    this._value = shallowRef<T>(this.defaultValue);
  }

  clone(options?: FormFieldOptions<T>): FormField<T, TData, TOptions> {
    return new FormField<T, TData, TOptions>(assign(<FormFieldOptions<T>> {
      defaultValue: this.defaultValue,
      name: this.name,
      validator: [...this.validator.rules],
      validateOnChange: this.validateOnChange,
      transform: [...this.transformers],
      parent: this.parent,
      disabled: this._disabledByUser,
    }, options));
  }

  protected internalGetValue() { return this._value.value; }

  setValue(value: T, maskAsDirty = true): void {
    value = this.prepareValueToSet(value);

    if (this._value.value === value) return;

    this._value.value = value;
    maskAsDirty ? this.markAsDirty() : this.markAsPristine();
    this.tryChangeValidate();
    this.emitChange();
  }

  reset(): void {
    this.setValue(this.defaultValue, false);
    super.reset();
  }

  private prepareValueToSet(value: T): T {
    if (isAbsent(value)) return undefined;
    if (isString(value)) return trim(value) as T;
    return value;
  }

  asEnum<TEnum extends number|string>(): FormField<TEnum> {
    return this as any;
  }
}

export function field<
  T extends PrimitiveField,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
>(options?: FormFieldOptions<T>): FormField<T, TData, TOptions> {
  return new FormField<T, TData, TOptions>(options);
}
