import {dispatcherInvoke, Optional, StringMap} from "@/utils/core-utils";
import {ValidationRule, Validator} from "@/validation";
import {computed, ComputedRef, reactive, ref} from "vue";
import {EventEmitter} from "@/utils/observable-utils";

export abstract class AbstractFormField<T = any> {
  private _validator: Optional<Validator<T>>;
  private readonly _dirtyAndInvalid: ComputedRef<boolean>;
  private readonly _valid: ComputedRef<boolean>;
  private readonly _invalid: ComputedRef<boolean>;
  private _validateOnChange: boolean = true;
  private readonly _change = new EventEmitter<T>();
  private readonly _reset = new EventEmitter();
  private readonly _errors = ref<string[]>([]);
  private readonly _dirty = ref<boolean>(false);
  private readonly _pristine: ComputedRef<boolean>;
  private readonly _data = reactive<StringMap>({});
  readonly options: StringMap = {};

  element: Optional<Element>;
  name?: string;

  get value() {
    return this.getValue();
  }

  set value(value: T) {
    this.setValue(value);
  }

  get errors(): string[] {
    return this._errors.value;
  }

  get valid() {
    return this._valid.value;
  }

  get invalid() {
    return this._invalid.value;
  }

  get dirtyAndInvalid() {
    return this._dirtyAndInvalid.value;
  }

  get dirty() {
    return this._dirty.value;
  }

  get pristine() {
    return this._pristine.value;
  }

  get change() {
    return this._change.event;
  }

  get onReset() {
    return this._reset.event;
  }

  get data() {
    return this._data;
  }

  protected constructor() {
    this._dirty = ref<boolean>(false);
    this._pristine = computed<boolean>(() => !this.dirty);
    this._valid = computed(() => this.errors.length == 0);
    this._invalid = computed(() => !this.valid);
    this._dirtyAndInvalid = computed(() => this.dirty && this.invalid);
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  validateOnChange(validate = true): this {
    this._validateOnChange = validate;
    return this;
  }

  validator(...validators: ValidationRule<T>[]): this {
    if (this._validator) this._validator.addRules(...validators);
    else this._validator = new Validator<T>(validators);
    return this;
  }

  protected hasValidationRule(name: string): boolean {
    return this._validator?.hasRule(name) ?? false;
  }

  protected abstract getValue(): T;

  abstract setValue(value: T, maskAsDirty?: boolean): void;

  protected tryOnChangeValidate(): void {
    if (this._validateOnChange) this.validate();
  }

  protected emitChange(): void {
    this._change.emit(this.value);
  }

  focus(): void {
    const element = this.element;
    if (element instanceof HTMLElement) dispatcherInvoke(() => element.focus());
  }

  reset(): void {
    this.clearErrors();
    this._reset.emit();
  }

  markAsDirty(): void {
    this._dirty.value = true;
  }

  markAsPristine(): void {
    this._dirty.value = false;
  }

  clearErrors(): void {
    this._errors.value = [];
  }

  addError(...messages: string[]): void {
    this._errors.value.push(...messages);
  }

  validate(markAsDirtyFirst = false, focus = false): boolean {
    const errors = this._validator?.validate(this.value, true, [this.name]);

    if (markAsDirtyFirst) this.markAsDirty();

    this._errors.value = (errors ?? []).map(err => err.message);

    if (focus && this.invalid) this.focus();

    return this.valid;
  }
}
