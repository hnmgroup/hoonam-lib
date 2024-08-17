import {computed, ComputedRef} from "vue";
import {each, get, isUndefined, kebabCase, keys, set, values} from "lodash-es";
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
    this.emitChange();
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

  clearErrors() {
    super.clearErrors();
    this._fields.forEach(field => field.clearErrors());
  }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    const formResult = this.validateSelf(markAsDirtyFirst, false);
    let fieldsResult = true;
    for (const field of this._fields) {
      let valid: boolean;
      if (field instanceof FormFieldGroup && isUndefined(field.value)) {
        valid = field.validateSelf(markAsDirtyFirst, false);
        if (!valid) valid = field.validate(markAsDirtyFirst, false);
      } else {
        valid = field.validate(markAsDirtyFirst, false);
      }
      this.addError(...field.errors);
      fieldsResult &&= valid;
    }

    if (focus) this.focusInvalidField();

    return formResult && fieldsResult;
  }

  private validateSelf(markAsDirtyFirst: boolean, focus: boolean): boolean {
    this.clearErrors();
    return super.validate(markAsDirtyFirst, focus);
  }

  focusInvalidField(): void {
    const field = this._fields.find(field => field.invalid);

    if (isAbsent(field)) return;

    if (field instanceof FormFieldGroup || field instanceof FormFieldArray) {
      field.focusInvalidField();
    } else {
      field.focus();
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
