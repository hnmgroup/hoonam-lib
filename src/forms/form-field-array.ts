import {computed, ComputedRef, shallowRef, triggerRef} from "vue";
import {AbstractFormField, setParent} from "./abstract-form-field";
import {ExtractFormField} from "./forms-types";
import {isUndefined} from "lodash-es";
import {FormFieldGroup} from "@/forms/form-field-group";
import {isAbsent, EventEmitter} from "@/utils/core-utils";

export class FormFieldArray<T> extends AbstractFormField<T[]> {
  private readonly _fields = shallowRef<AbstractFormField<T>[]>([]);
  private readonly _value: ComputedRef<T[]>;
  private readonly _size: ComputedRef<number>;
  private readonly _itemField: AbstractFormField<T>;
  private readonly _itemChange = new EventEmitter<{index: number; name: string; value: any;}>();
  private readonly _dirtyErrors: ComputedRef<string[]>;
  private readonly _isDirty: ComputedRef<boolean>;

  get dirtyErrors() { return this._dirtyErrors.value; }

  get dirty() { return this._isDirty.value; }

  get size() { return this._size.value; }

  get fields(): readonly ExtractFormField<T>[] { return this._fields.value as any; }

  get itemChange() { return this._itemChange.event; }

  constructor(itemField: ExtractFormField<T>) {
    super();
    this._itemField = itemField as AbstractFormField<T>;
    this._isDirty = computed<boolean>(() => this._fields.value.some(field => field.dirty));
    this._dirtyErrors = computed<string[]>(() => {
      const selfErrors = this._isDirty.value ? this.errors : [];
      const fieldErrors = this._fields.value.filter(field => field.dirtyAndInvalid).flatMap(field => field.errors);
      return selfErrors.concat(fieldErrors);
    });
    this._value = computed<any[]>(() =>
      this._fields.value.filter(field => field.hasValue).map(field => field.value)
    );
    this._size = computed(() => this._fields.value.length);
  }

  private itemChanged(field: AbstractFormField): void {
    this.tryOnChangeValidate();
    this._itemChange.emit({
      index: this._fields.value.indexOf(field),
      name: field.name,
      value: field.value,
    });
    this.emitChange();
  }

  clone(): FormFieldArray<T> {
    const that = new FormFieldArray<T>(this._itemField as any);
    super.cloneTo(that);
    return that;
  }

  protected getValue() { return this._value.value; }

  setValue(value: T[], maskAsDirty = true): void {
    this._fields.value.splice(0, this._fields.value.length);
    value.forEach(itemValue => {
      const field = this.createNewField(itemValue, maskAsDirty);
      this._fields.value.push(field);
    });
    triggerRef(this._fields);
    this.emitChange();
  }

  reset(): void {
    this._fields.value = [];
    super.reset();
  }

  focusInvalidField(): void {
    const field = this._fields.value.find(field => field.invalid);

    if (isAbsent(field)) return;

    if (field instanceof FormFieldGroup || field instanceof FormFieldArray) {
      field.focusInvalidField();
    } else {
      field.focus();
    }
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

  private createNewField(value?: T, maskAsDirty = true): AbstractFormField {
    const field: AbstractFormField = this._itemField.clone();
    if (!isUndefined(value)) field.setValue(value, maskAsDirty);
    field.change.subscribe(() => this.itemChanged(field));
    setParent(field, this);
    return field;
  }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    const selfResult = super.validate(markAsDirtyFirst, false);

    let itemsResult = true;
    for (const field of this._fields.value) {
      const valid = field.validate(markAsDirtyFirst, false);
      this.addError(...field.errors);
      itemsResult &&= valid;
    }

    if (focus) this.focusInvalidField();

    return selfResult && itemsResult;
  }
}

export function fieldArray<T>(itemField: ExtractFormField<T>): FormFieldArray<T> {
  return new FormFieldArray<T>(itemField);
}
