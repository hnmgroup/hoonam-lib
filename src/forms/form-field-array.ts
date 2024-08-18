import {computed, ComputedRef, ref, Ref} from "vue";
import {AbstractFormField} from "./abstract-form-field";
import {ExtractFormField} from "./forms-types";
import {isUndefined} from "lodash-es";

type FormFieldArrayItem<T> = T & { _id: string; };

export class FormFieldArray<T> extends AbstractFormField<T[]> {
  private readonly _fields: Ref<AbstractFormField<T>[]> = ref([]);
  private readonly _value: ComputedRef<T[]>;

  get fields(): ExtractFormField<T>[] { return this._fields.value as any; }

  constructor(private readonly fieldFactory: () => ExtractFormField<T>) {
    super();
    this._fields.value = [];
    this._value = computed<any[]>(() => this._fields.value.map((field) => field.value));
  }

  protected getValue() { return this._value.value; }

  setValue(value: T[], maskAsDirty = true): void {
    // notImplemented(); TODO: continue...
  }

  focusInvalidField(): void {
    // code
  }

  clear(): void {
    // notImplemented();
  }

  add(value?: T): void {
    const field = this.fieldFactory() as AbstractFormField;
    if (!isUndefined(value)) field.setValue(value);
    this._fields.value.push(field);
  }

  // reset(): void {
  //   notImplemented();
  // }
  //
  // markAsPristine(): void {
  //   notImplemented();
  // }
  //
  // markAsDirty() {
  //   notImplemented();
  // }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    return super.validate(markAsDirtyFirst, focus);
  }
}

export function fieldArray<T>(fieldFactory: () => ExtractFormField<T>): FormFieldArray<T> {
  return new FormFieldArray<T>(fieldFactory);
}
