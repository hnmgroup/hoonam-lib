import {shallowRef, ShallowRef} from "vue";
import {Optional} from "@/utils/core-utils";
import {PrimitiveField, ValueTransformer, FormFieldOptions} from "./forms-types";
import {AbstractFormField} from "./abstract-form-field";

export class FormField<T extends PrimitiveField> extends AbstractFormField<T> {
  private readonly _value: ShallowRef<T>;
  protected readonly transformers: readonly ValueTransformer<T>[];
  readonly defaultValue: Optional<T>;

  constructor(options?: FormFieldOptions<T>) {
    super(options?.name, options?.validator, options?.validateOnChange);
    this.defaultValue = options?.defaultValue;
    this.transformers = Array.from(options?.transform ?? []);
    this._value = shallowRef<T>(this.defaultValue);
  }

  clone(name?: string, validateOnChange?: boolean): FormField<T> {
    return new FormField<T>({
      defaultValue: this.defaultValue,
      name: name ?? this.name,
      validator: [...this.validator.rules],
      validateOnChange: validateOnChange ?? this.validateOnChange,
      transform: [...this.transformers],
    });
  }

  protected getValue() { return this._value.value; }

  setValue(value: T, maskAsDirty = true): void {
    value = this.transformValue(value);

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

  private transformValue(value: T): T {
    return this.transformers.reduce((result, transform) => transform(result), value);
  }
}

export function field<T extends PrimitiveField>(options?: FormFieldOptions<T>): FormField<T> {
  return new FormField<T>(options);
}
