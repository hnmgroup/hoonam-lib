import {dispatcherInvoke, Optional, StringMap, EventEmitter} from "@/utils/core-utils";
import {ReadonlyValidator, ValidationRule, Validator} from "@/validation";
import {computed, ComputedRef, shallowRef, ref, shallowReactive} from "vue";
import {isUndefined, set} from "lodash-es";

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
  readonly options: StringMap = {};
  element: Optional<Element>;
  private _parent: Optional<AbstractFormField>;

  get parent() { return this._parent; }

  get root(): Optional<AbstractFormField> {
    let root = this._parent;
    while (root?._parent) root = root._parent;
    return root;
  }

  abstract clone(name?: string, validateOnChange?: boolean): AbstractFormField<T>;

  get value() {
    return this.getValue();
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

  protected constructor(
    readonly name?: string,
    validationRules?: ValidationRule<T>[],
    readonly validateOnChange?: boolean,
  ) {
    this._error = computed(() => this._errors.value[0]);
    this.validator = new Validator<T>(...(validationRules ?? []));
    this._dirty = shallowRef<boolean>(false);
    this._pristine = computed<boolean>(() => !this.dirty);
    this._valid = computed(() => this.errors.length == 0);
    this._invalid = computed(() => !this.valid);
    this._dirtyAndInvalid = computed(() => this.dirty && this.invalid);
  }

  protected hasValidationRule(name: string): boolean {
    return this.validator.hasRule(name);
  }

  protected abstract getValue(): T;

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

export function setParent(field: AbstractFormField, parent: AbstractFormField): void {
  set(field, "_parent", parent);
}
