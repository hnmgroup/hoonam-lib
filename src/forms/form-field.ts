import {ref, Ref} from "vue";
import {Optional} from "@/utils/core-utils";
import {PrimitiveField, ValueTransformer} from "./forms-types";
import {AbstractFormField} from "./abstract-form-field";

export class FormField<T extends PrimitiveField> extends AbstractFormField<T> {
  static readonly transforms: ValueTransformer<any>[] = [];

  private readonly _value: Ref<T>;
  private readonly _defaultValue: Optional<T>;
  private readonly _transform: ValueTransformer<T>[] = [];

  get defaultValue() { return this._defaultValue; }

  constructor(defaultValue?: T) {
    super();
    this._defaultValue = defaultValue;
    this._value = ref<T>(this._defaultValue) as Ref<T>;
  }

  transform(...transform: ValueTransformer<T>[]): this {
    this._transform.push(...transform);
    return this;
  }

  protected getValue() { return this._value.value; }

  setValue(value: T, maskAsDirty = true): void {
    value = this.transformValue(value);

    if (this._value.value === value) return;

    this._value.value = value;
    maskAsDirty ? this.markAsDirty() : this.markAsPristine();
    this.emitChange();
  }

  reset(): void {
    this.setValue(this._defaultValue, false);
    super.reset();
  }

  private transformValue(value: T): T {
    return FormField.transforms.concat(this._transform)
      .reduce((result, transform) => transform(result), value);
  }
}

export function field<T extends PrimitiveField>(defaultValue?: T): FormField<T> {
  return new FormField<T>(defaultValue);
}
