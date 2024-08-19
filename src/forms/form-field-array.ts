import {computed, ComputedRef, ref, Ref} from "vue";
import {AbstractFormField} from "./abstract-form-field";
import {ExtractFormField, ExtractFormFieldArray} from "./forms-types";
import {cloneDeep, isUndefined} from "lodash-es";
import {fieldGroup, FormFieldGroup} from "@/forms/form-field-group";

type FormFieldArrayItem<T> = T & { _id: string; };

export class FormFieldArray<T> extends AbstractFormField<T[]> {
  private readonly _fields = ref<AbstractFormField<T>[]>([]);
  private readonly _value: ComputedRef<T[]>;

  get fields(): ExtractFormField<T>[] { return this._fields.value as any; }

  constructor(private readonly itemFactory: () => ExtractFormFieldArray<T>) {
    super();
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
    const field = new FormFieldGroup(this.itemFactory() as any);
    if (!isUndefined(value)) field.setValue(value as any);
    this._fields.value.push(field as any);
    debugger
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

export function fieldArray<T>(itemFactory: () => ExtractFormFieldArray<T>): FormFieldArray<T> {
  return new FormFieldArray<T>(itemFactory);
}
