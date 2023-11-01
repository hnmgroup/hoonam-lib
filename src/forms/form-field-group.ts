import {computed, ComputedRef, ref, Ref} from "vue";
import {Observable, Subject} from "rxjs";
import {cloneDeep, keys, mapKeys, values} from "lodash-es";
import {isEmpty, nonEmpty} from "@/utils/string-utils";
import {ValidationError} from "yup";
import {FormField, FormFieldOptions} from "./form-field";
import {dispatcherInvoke, isAbsent, isPresent, Optional, StringMap} from "@/utils/core-utils";

export class FormFieldGroup<T = any> extends FormField<T> {
  private readonly _fields: {[Field in keyof T]: FormField<T[Field]>};
  private readonly _fieldObjects: ComputedRef<FormField[]>;
  private readonly _formErrors: Ref<string[]>;
  private readonly _fieldChange = new Subject<{name: string; value: any; }>();
  private readonly _fieldErrors: ComputedRef<StringMap<string[]>>;
  private readonly _hasInvalidDirtyFields: ComputedRef<boolean>;
  private readonly _dirtyFieldErrorMessages: ComputedRef<string[]>;

  get value() { return this._value.value; }
  set value(value: T) { this.setValue(value); }
  getValue(useFieldAlias: boolean = false): any {
    const formValue = cloneDeep(this.value);
    if (!useFieldAlias) return formValue;
    return mapKeys(
      formValue as StringMap,
      (value: any, name: string) => ((this._fields as any)[name] as FormField).alias ?? name,
    );
  }

  get fieldErrors() { return this._fieldErrors.value; }
  get hasInvalidDirtyFields() { return this._hasInvalidDirtyFields.value; }
  get dirtyFieldErrorMessages() { return this._dirtyFieldErrorMessages.value; }

  get fields(): {[Field in keyof T]: FormField<T[Field]>} { return this._fields; }

  get fieldChange(): Observable<{name: string; value: any; }> { return this._fieldChange; }

  constructor(fields: Required<{[Field in keyof T]: FormField<T[Field]>}>, options?: Partial<FormFieldGroupOptions<T>>) {
    super(options);
    this._formErrors = ref<string[]>([]);
    this._fields = fields;
    this._fieldObjects = computed(() => values<FormField>(this._fields));
    this._errors = computed<string[]>(() => {
      return this._fieldObjects.value.flatMap(field => field.errorMessages).concat(this._formErrors.value);
    });
    this._dirtyFieldErrorMessages = computed<string[]>(() => {
      return this._fieldObjects.value
        .filter(field => field.dirtyAndInvalid).flatMap(field => field.errorMessages)
        .concat(this.dirty ? this._formErrors.value : []);
    });
    this._fieldErrors = computed<StringMap<string[]>>(() => {
      const fieldErrors: StringMap<string[]> = {};
      this._fieldObjects.value.forEach(field => fieldErrors[field.name] = Array.from(field.errorMessages));
      fieldErrors[""] = Array.from(this._formErrors.value);
      return fieldErrors;
    });
    this._dirty = computed<boolean>(() => this._fieldObjects.value.some(field => field.dirty));
    this._pristine = computed<boolean>(() => this._fieldObjects.value.every(field => field.pristine));
    this._hasInvalidDirtyFields = computed<boolean>(() => this._fieldObjects.value.some(f => f.dirtyAndInvalid));
    this.configValueAndDefaultValue(fields);
    keys(fields).forEach(name => this.configField((fields as StringMap<FormField>)[name], name));
  }

  setValue(value: T, resetState = false): void {
    this._fieldObjects.value.forEach(field => field.value = (value as any)?.[field.name]);
    if (resetState) this.markAsPristine();
  }

  patchValue(value: Partial<T>, resetState = false): void {
    keys(value)
      .map((name) => this._fieldObjects.value.find(field => field.name == name))
      .forEach(field => field.value = (value as any)?.[field.name]);
    if (resetState) this.markAsPristine();
  }

  focusOnFirstInvalidField(): void {
    if (isAbsent(this.element)) return;
    const invalidField = this.findFirstInvalidField();
    if (isAbsent(invalidField)) return;

    const invalidFieldElement: HTMLElement =
      this.element.querySelector(`[name="${invalidField.name}"]`) ??
      this.element.querySelector(`[id="${invalidField.name}"]`) ??
      this.element.querySelector(`[data-field-name="${invalidField.name}"]`);
    if (isPresent(invalidFieldElement)) dispatcherInvoke(() => invalidFieldElement.focus());
  }

  focusOnField(name: string): void {
    if (isAbsent(this.element)) return;
    const field = this._fieldObjects.value.find(f => f.name == name);
    if (isAbsent(field)) return;

    const fieldElement: HTMLElement =
      this.element.querySelector(`[name="${field.name}"]`) ??
      this.element.querySelector(`[id="${field.name}"]`);
    if (isPresent(fieldElement)) dispatcherInvoke(() => fieldElement.focus());
  }

  private configValueAndDefaultValue(fields: StringMap<FormField>): void {
    const initialValue: StringMap = {};
    keys(fields).forEach(name => initialValue[name] = fields[name].defaultValue);
    this._defaultValue = initialValue as T;
    this._value = ref<T>(this._defaultValue) as Ref<T>;
  }

  private configField(field: FormField, name: string): void {
    field.name = name;
    field.change.subscribe(() => this.fieldChanged(field));
  }

  private findFirstInvalidField(): Optional<FormField> {
    return this._fieldObjects.value.find(field => field.invalid);
  }

  private fieldChanged(field: FormField): void {
    (this._value.value as any)[field.name] = field.value;
    this._fieldChange.next({name: field.name, value: field.value});
    this._change.next(field.value);
    if (this._validateOnValueUpdate) this.validate();
  }

  reset(...fields: Array<keyof T>): void {
    const formFields = this._fieldObjects.value.filter((field) => fields.length == 0 || fields.includes(field.name as any));
    formFields.forEach(field => field.reset());
    this._formErrors.value = [];
    this._onReset?.();
  }

  markAsPristine(fieldName?: string) {
    this._fieldObjects.value
      .filter(field => isEmpty(fieldName) || field.name === fieldName)
      .forEach(field => field.markAsPristine());
  }

  markAsDirty(fieldName?: string) {
    this._fieldObjects.value
      .filter(field => isEmpty(fieldName) || field.name === fieldName)
      .forEach(field => field.markAsDirty());
  }

  addError(message: string, fieldName?: string) {
    if (nonEmpty(fieldName)) this._fieldObjects.value.find(field => field.name === fieldName).addError(message);
    else this._formErrors.value.push(message);
  }

  validate(markAsDirtyFirst = false, focusOnFailed = false): boolean {
    if (markAsDirtyFirst) this.markAsDirty();

    this._formErrors.value = [];

    let isValid = true;

    this._fieldObjects.value.forEach(field => {
      isValid = field.validate() && isValid;
    });

    try { this._validator?.validateSync(this.value); }
    catch (error: any) {
      if (!(error instanceof ValidationError)) throw error;

      isValid = false;
      this._formErrors.value.push(error.message);
    }

    if (!isValid && focusOnFailed) this.focusOnFirstInvalidField();

    return isValid;
  }

  tryAddError(message: string, fieldName?: string): boolean {
    if (nonEmpty(fieldName) && !this._fieldObjects.value.some(field => field.name === fieldName)) return false;
    this.addError(message, fieldName);
    return true;
  }
}

type FormFieldGroupOptions<T> = Omit<FormFieldOptions<T>, "defaultValue">;
