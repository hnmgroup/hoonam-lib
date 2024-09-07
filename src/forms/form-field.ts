import {shallowRef, ShallowRef} from "vue";
import {Optional} from "@/utils/core-utils";
import {PrimitiveField, FormFieldOptions} from "./forms-types";
import {AbstractFormField} from "./abstract-form-field";
import {assign, isString} from "lodash-es";
import {trim} from "@/utils/string-utils";

export class FormField<T extends PrimitiveField> extends AbstractFormField<T> {
  private readonly _value: ShallowRef<T>;
  readonly defaultValue: Optional<T>;

  constructor(options?: FormFieldOptions<T>) {
    super(options);
    this.defaultValue = options?.defaultValue;
    this._value = shallowRef<T>(this.defaultValue);
  }

  clone(options?: FormFieldOptions<T>): FormField<T> {
    return new FormField<T>(assign(<FormFieldOptions<T>> {
      defaultValue: this.defaultValue,
      name: this.name,
      validator: [...this.validator.rules],
      validateOnChange: this.validateOnChange,
      transform: [...this.transformers],
      parent: this.parent,
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
    return isString(value) ? trim(value) as T : value;
  }

  asEnum<TEnum extends number|string = number>(): FormField<TEnum> {
    return this as any;
  }
}

export function field<T extends PrimitiveField>(options?: FormFieldOptions<T>): FormField<T> {
  return new FormField<T>(options);
}
