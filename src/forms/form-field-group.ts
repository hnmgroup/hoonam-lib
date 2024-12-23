import {computed, ComputedRef, unref} from "vue";
import {assign, cloneDeep, each, get, isUndefined, keys, set, clone} from "lodash-es";
import {isPresent, EventEmitter, Optional, StringMap} from "@/utils/core-utils";
import {ExtractFormFieldGroup, FormFieldGroupOptions} from "./forms-types";
import {AbstractFormField} from "./abstract-form-field";
import {ValidationError} from "@/validation";

export class FormFieldGroup<
  T extends object,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
> extends AbstractFormField<T, TData, TOptions> {
  private readonly _fields: readonly AbstractFormField[];
  private readonly _fieldsDef: ExtractFormFieldGroup<Required<T>>;
  private readonly _fieldChange = new EventEmitter<{ name: string; field: AbstractFormField; }>();
  private readonly _value: ComputedRef<T>;
  private readonly _dirtyErrors: ComputedRef<string[]>;
  private readonly _isDirty: ComputedRef<boolean>;

  get dirtyErrors(): readonly string[] { return this._dirtyErrors.value; }

  get dirty() { return this._isDirty.value; }

  get fieldChange() { return this._fieldChange.event; }

  get fields(): ExtractFormFieldGroup<Required<T>> { return this._fieldsDef; }

  getFields(): AbstractFormField[] {
    return clone(this._fields) as AbstractFormField[];
  }

  constructor(fields: ExtractFormFieldGroup<Required<T>>, options?: FormFieldGroupOptions<T, TData, TOptions>) {
    super(options);
    const _fields: AbstractFormField[] = [];
    const _fieldsDef = {};
    each(fields, (fieldDef: AbstractFormField, name) => {
      const field = fieldDef.clone({
        name: fieldDef.name ?? name,
        validateOnChange: fieldDef.validateOnChange ?? this.validateOnChange,
        parent: this,
      });
      field.change.subscribe(() => this.fieldChanged(field));
      set(_fieldsDef, name, field);
      _fields.push(field);
    });
    this._fields = _fields;
    this._fieldsDef = _fieldsDef as ExtractFormFieldGroup<Required<T>>;
    this._isDirty = computed<boolean>(() => this._fields.some(field => field.dirty));
    this._dirtyErrors = computed<string[]>(() => {
      const selfErrors = this._isDirty.value ? this.getSelfValidationErrors().map(err => err.message) : [];
      const fieldErrors = this._fields.filter(field => field.dirtyAndInvalid).flatMap(field => field.errors);
      return selfErrors.concat(fieldErrors);
    });
    this._value = computed(() => {
      let isEmpty = true;
      const value = this._fields
        .filter(f => !f.disabled && f.hasValue)
        .reduce((result, field) => {
          isEmpty = false;
          return set(result, field.name, field.value);
        }, {} as any,
      );
      return isEmpty ? undefined : value;
    });
  }

  clone(options?: FormFieldGroupOptions<T, TData, TOptions>): FormFieldGroup<T, TData, TOptions> {
    return new FormFieldGroup<T, TData, TOptions>(this._fieldsDef, assign(<FormFieldGroupOptions<T, TData, TOptions>> {
      name: this.name,
      validator: [...this.validator.rules],
      validateOnChange: this.validateOnChange,
      transform: [...this.transformers],
      parent: this.parent,
      disabled: this._disabledByUser,
      data: cloneDeep(unref(this.data)),
      options: this.options,
    }, options));
  }

  protected internalGetValue() { return this._value.value; }

  getValue(): T {
    if (!this.canTransformValue()) return undefined;

    let isEmpty = true;
    const value = this._fields
      .filter(field => field.hasValidValue)
      .reduce((result, field) => {
        const value = field.getValue();
        if (!isUndefined(value)) {
          isEmpty = false;
          set(result, field.name, value);
        }
        return result;
      }, {} as T);
    return isEmpty ? undefined : super.transform(value);
  }

  setValue(value: T, markAsPristine?: boolean): void {
    this._fields.forEach(field => field.setValue(get(value, field.name), markAsPristine));
  }

  patchValue(value: Partial<T>, markAsPristine?: boolean): void {
    keys(value)
      .map((name) => this._fields.find(field => field.name == name))
      .forEach(field => field?.setValue(get(value, field.name), markAsPristine));
  }

  clearValue(markAsPristine?: boolean): void {
    this.setValue({} as T, markAsPristine);
  }

  private fieldChanged(field: AbstractFormField): void {
    this.tryChangeValidate();
    this._fieldChange.emit({
      field,
      name: field.name,
    });
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
    const fieldErrors: string[] = [];
    let result = true;
    for (const field of this._fields) {
      let valid: boolean;
      if (field instanceof FormFieldGroup && !field.hasValue) {
        valid = field.validateSelf(markAsDirtyFirst);
      } else {
        valid = field.validate(markAsDirtyFirst, false);
      }
      fieldErrors.push(...field.errors);
      result &&= valid;
    }

    super.clearErrors();
    this.addError(...fieldErrors);
    result &&= this.validateSelf(markAsDirtyFirst);

    if (focus && !result) this.focusInvalid();

    return result;
  }

  findField<TField extends AbstractFormField = AbstractFormField>(fieldPath: string): Optional<TField> {
    return fieldPath.split(".").reduce<AbstractFormField>(
      (form, name) => (form as FormFieldGroup<any>)?._fields.find(f => f.name == name),
      this,
    ) as TField;
  }

  _getValidationErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const field of this._fields) {
      if (field instanceof FormFieldGroup && !field.hasValue) {
        errors.push(...field.getSelfValidationErrors());
      } else {
        errors.push(...field._getValidationErrors());
      }
    }
    errors.push(...this.getSelfValidationErrors());
    return errors;
  }

  private validateSelf(markAsDirtyFirst: boolean): boolean {
    if (markAsDirtyFirst) super.markAsDirty();
    super.clearErrors();
    const errors = super._getValidationErrors();
    super.addError(...errors.map(err => err.message));
    return super.valid;
  }

  private getSelfValidationErrors(): ValidationError[] {
    return super._getValidationErrors();
  }

  focusInvalid(): void {
    const field = this._fields.find(field => field.invalid);
    if (isPresent(field)) field.focusInvalid();
    else super.focusInvalid();
  }
}

export function fieldGroup<
  T extends object,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
>(
  fields: ExtractFormFieldGroup<Required<T>>,
  options?: FormFieldGroupOptions<T, TData, TOptions>,
): FormFieldGroup<T, TData, TOptions> {
  return new FormFieldGroup<T, TData, TOptions>(fields, options);
}
