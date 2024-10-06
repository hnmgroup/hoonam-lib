import {dispatcherInvoke, Optional, StringMap, EventEmitter, isPresent, isAbsent} from "@/utils/core-utils";
import {ReadonlyValidator, ValidationError, Validator} from "@/validation";
import {computed, ComputedRef, shallowRef, ref, shallowReactive, unref, triggerRef} from "vue";
import {isBoolean, isFunction, isUndefined} from "lodash-es";
import {AbstractFormFieldOptions, FieldValueTransformer} from "./forms-types";

export abstract class AbstractFormField<
  T = any,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
> {
  private readonly _dirtyAndInvalid: ComputedRef<boolean>;
  private readonly _valid: ComputedRef<boolean>;
  private readonly _invalid: ComputedRef<boolean>;
  private readonly _change = new EventEmitter<T>();
  private readonly _reset = new EventEmitter();
  private readonly _errors = ref<string[]>([]);
  private readonly _error: ComputedRef<Optional<string>>;
  private readonly _dirty = ref<boolean>(false);
  private readonly _pristine: ComputedRef<boolean>;
  private readonly _data = shallowReactive<TData>({} as any);
  protected readonly validator: ReadonlyValidator<T>;
  protected readonly transformers: readonly FieldValueTransformer<T>[];
  readonly options: TOptions = {} as any;
  element: Optional<Element>;
  readonly parent: Optional<AbstractFormField>;
  readonly name: Optional<string>;
  readonly validateOnChange: Optional<boolean>;
  private readonly _hasValue: ComputedRef<boolean>;
  protected _disabledByUser: Optional<(field: AbstractFormField) => boolean> = undefined;
  private readonly _disabled: ComputedRef<boolean>;

  get root(): Optional<AbstractFormField> {
    let root: AbstractFormField = this;
    while (root?.parent) root = root.parent;
    return root;
  }

  get fullName(): Optional<string> {
    if (isAbsent(this.name)) return undefined;

    let name = this.name;
    let parent = this.parent;
    while (parent) {
      if (isPresent(parent.name)) name = parent.name + "." + name;
      parent = parent.parent;
    }

    return name;
  }

  get hasValue(): boolean { return this._hasValue.value; }
  get hasValidValue(): boolean { return this._getValidationErrors().length == 0; }

  get disabled(): boolean { return this._disabled.value; }

  get value() { return this.internalGetValue(); }
  set value(value: T) { this.setValue(value); }

  protected abstract internalGetValue(): T;
  abstract setValue(value: T, maskAsDirty?: boolean): void;
  /** get transformed value */
  getValue(): T {
    if (!this.canTransformValue()) return undefined;
    return this.transform(this.value);
  }

  enable(): void {
    this._disabledByUser = undefined;
    triggerRef(this._disabled);
    this.updateErrors();
  }
  disable(): void {
    this._disabledByUser = () => true;
    triggerRef(this._disabled);
    this.updateErrors();
  }

  protected canTransformValue(): boolean {
    return !this.disabled && this.hasValidValue;
  }

  protected transform(value: T): T {
    return this.transformers.reduce(
      (result, transform) => isFunction(transform)
        ? transform(result)
        : transform.transform(result, this),
      unref(value),
    );
  }

  get errors(): string[] {
    return this._errors.value;
  }

  get error(): Optional<string> {
    return this._error.value;
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

  get data(): TData {
    return this._data;
  }

  protected constructor(options?: AbstractFormFieldOptions<T>) {
    this.parent = options?.parent;
    this.name = options?.name;
    this.validateOnChange = options?.validateOnChange;
    this.validator = new Validator<T>(...(options?.validator ?? []));
    this.transformers = Array.from(options?.transform ?? []);
    this._error = computed(() => this._errors.value[0]);
    this._dirty = shallowRef<boolean>(false);
    this._pristine = computed<boolean>(() => !this.dirty);
    this._valid = computed(() => this.errors.length == 0);
    this._invalid = computed(() => !this.valid);
    this._dirtyAndInvalid = computed(() => this.dirty && this.invalid);
    this._hasValue = computed(() => !isUndefined(this.value));
    if (options?.disabled) {
      this._disabledByUser = isBoolean(options.disabled)
        ? () => !!options.disabled
        : options.disabled;
    }
    this._disabled = computed(() => this._disabledByUser?.(this) ?? false);
  }

  abstract clone(options?: AbstractFormFieldOptions<T>): AbstractFormField<T, TData, TOptions>;

  protected hasValidationRule(name: string): boolean {
    return this.validator.hasRule(name);
  }

  protected tryChangeValidate(): void {
    if (this.validateOnChange ?? true) this.validate();
  }

  protected emitChange(): void {
    this._change.emit(this.transform(this.value));
  }

  focus(): void {
    const element = this.element;
    if (element instanceof HTMLElement) dispatcherInvoke(() => element.focus());
  }

  focusInvalid(): void {
    if (this.invalid) this.focus();
  }

  reset(): void {
    this.clearErrors();
    this.markAsPristine();
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
    if (markAsDirtyFirst) this.markAsDirty();
    this.updateErrors();
    if (focus && this.invalid) this.focus();
    return this.valid;
  }

  private updateErrors(): void {
    const errors = this._getValidationErrors();
    this._errors.value = errors.map(err => err.message);
  }

  _getValidationErrors(): ValidationError[] {
    if (this._disabled.value) return [];
    return this.validator.validate(this.value, true, [this.fullName, this]);
  }
}
