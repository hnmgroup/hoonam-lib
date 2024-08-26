import {dispatcherInvoke, Optional, StringMap, EventEmitter} from "@/utils/core-utils";
import {ReadonlyValidator, Validator} from "@/validation";
import {computed, ComputedRef, shallowRef, ref, shallowReactive} from "vue";
import {isUndefined} from "lodash-es";
import {AbstractFormFieldOptions, ValueTransformer} from "./forms-types";

export abstract class AbstractFormField<T = any> {
  private readonly _dirtyAndInvalid: ComputedRef<boolean>;
  private readonly _valid: ComputedRef<boolean>;
  private readonly _invalid: ComputedRef<boolean>;
  private readonly _change = new EventEmitter<T>();
  private readonly _reset = new EventEmitter();
  private readonly _errors = ref<string[]>([]);
  private readonly _error: ComputedRef<Optional<string>>;
  private readonly _dirty = ref<boolean>(false);
  private readonly _pristine: ComputedRef<boolean>;
  private readonly _data = shallowReactive<StringMap>({});
  protected readonly validator: ReadonlyValidator<T>;
  protected readonly transformers: readonly ValueTransformer<T>[];
  readonly options: StringMap = {};
  element: Optional<Element>;
  readonly parent: Optional<AbstractFormField>;
  readonly name: Optional<string>;
  readonly validateOnChange: Optional<boolean>;

  get root(): Optional<AbstractFormField> {
    let root: AbstractFormField = this;
    while (root?.parent) root = root.parent;
    return root;
  }

  get value() {
    return this.internalGetValue();
  }

  set value(value: T) {
    this.setValue(value);
  }

  get hasValue(): boolean { return !isUndefined(this.value); }

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

  get data(): StringMap {
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
  }

  abstract clone(options?: AbstractFormFieldOptions<T>): AbstractFormField<T>;

  protected hasValidationRule(name: string): boolean {
    return this.validator.hasRule(name);
  }

  protected abstract internalGetValue(): T;

  getValue(): T {
    return this.transformers.reduce(
      (result, transform) => transform(result),
      this.internalGetValue(),
    );
  }

  abstract setValue(value: T, maskAsDirty?: boolean): void;

  protected tryChangeValidate(): void {
    if (this.validateOnChange ?? true) this.validate();
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
    if (markAsDirtyFirst) this.markAsDirty();
    const errors = this.validator.validate(this.value, true, [this.name, this]);
    this._errors.value = errors.map(err => err.message);
    if (focus && this.invalid) this.focus();
    return this.valid;
  }
}
