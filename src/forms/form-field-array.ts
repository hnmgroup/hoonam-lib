import {computed, ComputedRef, shallowRef, triggerRef, unref} from "vue";
import {AbstractFormField} from "./abstract-form-field";
import {ExtractFormField, FormFieldArrayOptions} from "./forms-types";
import {assign, isUndefined} from "lodash-es";
import {EventEmitter, isPresent, StringMap} from "@/utils/core-utils";
import {ValidationError} from "@/validation";

export class FormFieldArray<
  T,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
> extends AbstractFormField<T[], TData, TOptions> {
  private readonly _fields = shallowRef<AbstractFormField<T>[]>([]);
  private readonly _value: ComputedRef<T[]>;
  private readonly _size: ComputedRef<number>;
  private readonly _itemField: AbstractFormField<T>;
  private readonly _itemChange = new EventEmitter<{ index: number; name: string; value: any; }>();
  private readonly _dirtyErrors: ComputedRef<string[]>;
  private readonly _isDirty: ComputedRef<boolean>;

  get dirtyErrors() { return this._dirtyErrors.value; }

  get dirty() { return this._isDirty.value; }

  get size() { return this._size.value; }

  get fields(): readonly ExtractFormField<T>[] { return this._fields.value as any; }

  get itemChange() { return this._itemChange.event; }

  constructor(itemField: ExtractFormField<T>, options?: FormFieldArrayOptions<T, TData, TOptions>) {
    super(options);
    this._itemField = itemField as AbstractFormField<T>;
    this._isDirty = computed<boolean>(() => this._fields.value.some(field => field.dirty));
    this._dirtyErrors = computed<string[]>(() => {
      const selfErrors = this._isDirty.value ? this.getSelfValidationErrors().map(err => err.message) : [];
      const fieldErrors = this._fields.value.filter(field => field.dirtyAndInvalid).flatMap(field => field.errors);
      return selfErrors.concat(fieldErrors);
    });
    this._value = computed<any[]>(() =>
      this._fields.value
        .filter(field => field.hasValue)
        .map(field => field.value)
    );
    this._size = computed(() => this._fields.value.length);
  }

  clone(options?: FormFieldArrayOptions<T, TData, TOptions>): FormFieldArray<T, TData, TOptions> {
    return new FormFieldArray<T, TData, TOptions>(this._itemField as any, assign(<FormFieldArrayOptions<T, TData, TOptions>> {
      name: this.name,
      validator: [...this.validator.rules],
      validateOnChange: this.validateOnChange,
      transform: [...this.transformers],
      parent: this.parent,
      disabled: this._disabledByUser,
      data: unref(this.data),
      options: this.options,
    }, options));
  }

  private createNewField(value?: T, markAsPristine?: boolean): AbstractFormField {
    const field: AbstractFormField = this._itemField.clone({
      validateOnChange: this.validateOnChange,
      parent: this,
    });
    if (!isUndefined(value)) field.setValue(value, markAsPristine);
    field.change.subscribe(() => this.itemChanged(field));
    return field;
  }

  private itemChanged(field: AbstractFormField): void {
    this.tryChangeValidate();
    this._itemChange.emit({
      index: this._fields.value.indexOf(field),
      name: field.name,
      value: field.value,
    });
    this.emitChange();
  }

  protected internalGetValue() { return this._value.value; }

  getValue(): T[] {
    if (!this.canTransformValue()) return undefined;

    const value = this._fields.value
      .filter(field => field.hasValidValue)
      .reduce((result, field) => {
        const value = field.getValue();
        if (!isUndefined(value)) result.push(value);
        return result;
      }, [] as T[]);
    return super.transform(value);
  }

  setValue(value: T[], markAsPristine?: boolean): void {
    this._fields.value.splice(
      0,
      this._fields.value.length,
      ...value.map(itemValue => this.createNewField(itemValue, markAsPristine)),
    );
    triggerRef(this._fields);
    this.emitChange();
  }

  clearValue(markAsPristine?: boolean): void {
    this.setValue([], markAsPristine);
  }

  reset(): void {
    this._fields.value = [];
    super.reset();
  }

  markAsPristine() {
    this._fields.value.forEach(field => field.markAsPristine());
  }

  markAsDirty() {
    this._fields.value.forEach(field => field.markAsDirty());
  }

  clearErrors() {
    super.clearErrors();
    this._fields.value.forEach(field => field.clearErrors());
  }

  clear(): void {
    this._fields.value = [];
    this.emitChange();
  }

  remove(item: T): void {
    const index = this._fields.value.findIndex(f => f.value === item);
    if (index < 0) return;
    this._fields.value.splice(index, 1);
    triggerRef(this._fields);
    this.emitChange();
  }

  add(value?: T): void {
    const field = this.createNewField(value);
    this._fields.value.push(field);
    triggerRef(this._fields);
    this.emitChange();
  }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    const itemErrors: string[] = [];
    let result = true;
    for (const field of this._fields.value) {
      const valid = field.validate(markAsDirtyFirst, false);
      itemErrors.push(...field.errors);
      result &&= valid;
    }

    super.clearErrors();
    this.addError(...itemErrors);
    result &&= super.validate(markAsDirtyFirst, false);

    if (focus && !result) this.focusInvalid();

    return result;
  }

  focusInvalid(): void {
    const field = this._fields.value.find(field => field.invalid);
    if (isPresent(field)) field.focusInvalid();
    else super.focusInvalid();
  }

  _getValidationErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const field of this._fields.value) {
      errors.push(...field._getValidationErrors());
    }
    errors.push(...super._getValidationErrors());
    return errors;
  }

  private getSelfValidationErrors(): ValidationError[] {
    return super._getValidationErrors();
  }
}

export function fieldArray<
  T,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
>(
  itemField: ExtractFormField<T>,
  options?: FormFieldArrayOptions<T, TData, TOptions>,
): FormFieldArray<T, TData, TOptions> {
  return new FormFieldArray<T, TData, TOptions>(itemField, options);
}
