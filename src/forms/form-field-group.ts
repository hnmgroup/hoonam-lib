import {computed, ComputedRef} from "vue";
import {each, get, isUndefined, keys, set, values} from "lodash-es";
import {dispatcherInvoke, isAbsent, Optional} from "@/utils/core-utils";
import {EventEmitter} from "@/utils/observable-utils";
import {ExtractFormFieldGroup} from "./forms-types";
import {AbstractFormField} from "./abstract-form-field";
import {FormFieldArray} from "./form-field-array";
import {FormField} from "./form-field";

export class FormFieldGroup<T extends object> extends AbstractFormField<T> {
  private readonly _fields: AbstractFormField[];
  private readonly _fieldChange = new EventEmitter<{name: string; value: any;}>();
  private readonly _dirtyErrors: ComputedRef<string[]>;
  private readonly _value: ComputedRef<T>;
  private readonly _isDirty: ComputedRef<boolean>;

  get dirtyErrors() { return this._dirtyErrors.value; }

  get dirty() { return this._isDirty.value; }

  get fieldChange() { return this._fieldChange.event; }

  constructor(readonly fields: ExtractFormFieldGroup<T>) {
    super();
    this._fields = values(fields);
    each<any>(fields, (field: AbstractFormField, name) => {
      field.name ??= name;
      field.change.subscribe(() => this.fieldChanged(field));
    });
    this._isDirty = computed<boolean>(() => this._fields.some(field => field.dirty));
    this._dirtyErrors = computed<string[]>(() => {
      const formErrors = this._isDirty.value ? this.errors : [];
      const fieldErrors = this._fields.filter(field => field.dirtyAndInvalid).flatMap(field => field.errors);
      return formErrors.concat(fieldErrors);
    });
    this._value = computed(() => {
      let isEmpty = true;
      const value = this._fields.reduce(
        (result, field) => {
          if (!isUndefined(field.value)) {
            isEmpty = false;
            set(result, field.name, field.value);
          }
          return result;
        },
        {} as any,
      );
      return isEmpty ? undefined : value;
    });
  }

  protected getValue() { return this._value.value; }

  setValue(value: T, maskAsDirty = true): void {
    this._fields.forEach(field => field.setValue(get(value, field.name), maskAsDirty));
  }

  patchValue(value: Partial<T>, maskAsDirty = true): void {
    keys(value)
      .map((name) => this._fields.find(field => field.name == name))
      .forEach(field => field.setValue(get(value, field.name), maskAsDirty));
  }

  private fieldChanged(field: AbstractFormField): void {
    this.tryOnChangeValidate();
    this._fieldChange.emit({name: field.name, value: field.value});
    this.emitChange(false);
  }

  reset(...fields: Array<keyof T>): void {
    const formFields = fields.length == 0
      ? this._fields
      : this._fields.filter((field) => fields.includes(field.name as any));
    formFields.forEach(field => field.reset());
    super.reset();
  }

  markAsPristine() {
    this._fields.forEach(field => field.markAsPristine());
  }

  markAsDirty() {
    this._fields.forEach(field => field.markAsDirty());
  }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    const formResult = super.validate(markAsDirtyFirst, false);
    const fieldsResult = this._fields
      .filter(field => field instanceof FormFieldGroup ? !isUndefined(field.value) : true)
      .reduce((result, field) => field.validate(markAsDirtyFirst, false) && result, true);
    if (focus) this.focusInvalidField();
    return formResult && fieldsResult;
  }

  focusInvalidField(): void {
    const field = this._fields.find(field => field.invalid);
    if (isAbsent(field)) {
      return;
    } else if (field instanceof FormFieldGroup) {
      field.focusInvalidField();
    } else if (field instanceof FormFieldArray) {
      field.focusInvalidField();
    } else if (field instanceof FormField) {
      if (field.element) {
        field.focus();
      } else {
        if (isAbsent(this.element)) return;
        const element: Element =
          this.element.querySelector(`[name="${field.name}"]`) ??
          this.element.querySelector(`[id="${field.name}"]`) ??
          this.element.querySelector(`[data-field="${field.name}"]`);
        if (element instanceof HTMLElement) dispatcherInvoke(() => element.focus());
      }
    }
  }

  findField(path: string): Optional<AbstractFormField> {
    return path.split('.').reduce<any>(
      (field: AbstractFormField, name) => field instanceof FormFieldGroup
        ? field._fields.find(_ => _.name == name)
        : undefined,
      this,
    );
  }
}

export function fieldGroup<T extends object>(fields: ExtractFormFieldGroup<T>): FormFieldGroup<T> {
  return new FormFieldGroup<T>(fields);
}
