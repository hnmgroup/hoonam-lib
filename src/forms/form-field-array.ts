import {ComputedRef, ref, Ref} from "vue";
import {AbstractFormField} from "./abstract-form-field";
import {ExtractFormField} from "./forms-types";
import {notImplemented} from "@/utils/core-utils";

type FormFieldArrayItem<T> = T & { _id: string; };

export class FormFieldArray<T extends I[], I> extends AbstractFormField<T> {
  private readonly _fields: Ref<readonly FormFieldArrayItem<ExtractFormField<I>>[]> = ref([]);
  private readonly _value: ComputedRef<T>;

  get fields() { return this._fields.value; }

  constructor(private readonly fieldFactory: () => ExtractFormField<I>) {
    super();
    notImplemented();
    // this._fields.value = [];
    // this._value = computed(() => this._fields.value.map((field: AbstractFormField) => field.value));
  }

  protected getValue() { return this._value.value; }

  setValue(value: T, maskAsDirty = true): void {
    notImplemented();
  }

  focusInvalidField(): void {
    // code
  }

  clear(): void {
    notImplemented();
  }

  add(...items: I[]): void {
    notImplemented();
  }

  reset(): void {
    notImplemented();
  }

  markAsPristine(): void {
    notImplemented();
  }

  markAsDirty() {
    notImplemented();
  }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    notImplemented();
  }
}

export function fieldArray<T extends I[], I>(fieldFactory: () => ExtractFormField<I>): FormFieldArray<T, I> {
  return new FormFieldArray<T, I>(fieldFactory);
}
