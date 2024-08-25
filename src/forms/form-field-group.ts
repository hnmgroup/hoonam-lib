import {computed, ComputedRef} from "vue";
import {each, get, isUndefined, keys, set} from "lodash-es";
import {isAbsent, EventEmitter} from "@/utils/core-utils";
import {ExtractFormFieldGroup, FormFieldGroupOptions} from "./forms-types";
import {AbstractFormField, setParent} from "./abstract-form-field";
import {FormFieldArray} from "./form-field-array";

export class FormFieldGroup<T extends object> extends AbstractFormField<T> {
  private readonly _fields: readonly AbstractFormField[];
  private readonly _fieldsDef: ExtractFormFieldGroup<T>;
  private readonly _fieldChange = new EventEmitter<{ name: string; value: any; }>();
  private readonly _value: ComputedRef<T>;
  private readonly _dirtyErrors: ComputedRef<string[]>;
  private readonly _isDirty: ComputedRef<boolean>;

  get dirtyErrors(): readonly string[] { return this._dirtyErrors.value; }

  get dirty() { return this._isDirty.value; }

  get fieldChange() { return this._fieldChange.event; }

  get fields(): ExtractFormFieldGroup<T> { return this._fieldsDef; }

  constructor(fields: ExtractFormFieldGroup<T>, options?: FormFieldGroupOptions<T>) {
    super(options?.name, options?.validator, options?.validateOnChange);
    const _fields: AbstractFormField[] = [];
    const _fieldsDef = {};
    each(fields, (fieldDef: AbstractFormField, name) => {
      const field = fieldDef.clone(
        fieldDef.name ?? name,
        fieldDef.validateOnChange ?? this.validateOnChange,
      );
      setParent(field, this);
      field.change.subscribe(() => this.fieldChanged(field));
      set(_fieldsDef, name, field);
      _fields.push(field);
    });
    this._fields = _fields;
    this._fieldsDef = _fieldsDef as ExtractFormFieldGroup<T>;
    this._isDirty = computed<boolean>(() => this._fields.some(field => field.dirty));
    this._dirtyErrors = computed<string[]>(() => {
      const selfErrors = this._isDirty.value ? this.errors : [];
      const fieldErrors = this._fields.filter(field => field.dirtyAndInvalid).flatMap(field => field.errors);
      return selfErrors.concat(fieldErrors);
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

  clone(name?: string, validateOnChange?: boolean): FormFieldGroup<T> {
    return new FormFieldGroup<T>(this._fieldsDef, {
      name: name ?? this.name,
      validator: [...this.validator.rules],
      validateOnChange: validateOnChange ?? this.validateOnChange,
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
    this.tryChangeValidate();
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
    const selfResult = this.validateSelf(markAsDirtyFirst);

    let fieldsResult = true;
    for (const field of this._fields) {
      let valid: boolean;
      if (field instanceof FormFieldGroup && !field.hasValue) {
        valid = field.validateSelf(markAsDirtyFirst);
      } else {
        valid = field.validate(markAsDirtyFirst, false);
      }
      this.addError(...field.errors);
      fieldsResult &&= valid;
    }

    if (focus) this.focusInvalidField();

    return selfResult && fieldsResult;
  }

  private validateSelf(markAsDirtyFirst: boolean): boolean {
    this.clearErrors();
    return super.validate(markAsDirtyFirst, false);
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
}

export function fieldGroup<T extends object>(
  fields: ExtractFormFieldGroup<T>,
  options?: FormFieldGroupOptions<T>,
): FormFieldGroup<T> {
  return new FormFieldGroup<T>(fields, options);
}
