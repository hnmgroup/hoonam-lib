import {FormField} from "./form-field";
import {FormFieldGroup} from "./form-field-group";
import {FormFieldArray} from "./form-field-array";

export type ValueTransformer<T> = (value: T) => T;

export type PrimitiveField = string | number | boolean | symbol | bigint | Date;

export type ExtractFormField<T> =
  T extends PrimitiveField
    ? FormField<T>
    : T extends (infer I)[]
      ? FormFieldArray<T, I>
      : T extends object
        ? FormFieldGroup<T>
        : never;

export type ExtractFormFieldGroup<T extends object> = {
  [Field in keyof T]: ExtractFormField<T[Field]>;
};

export function field<T extends PrimitiveField>(defaultValue?: T): FormField<T> {
  return new FormField<T>(defaultValue);
}

export function fieldGroup<T extends object>(fields: ExtractFormFieldGroup<T>): FormFieldGroup<T> {
  return new FormFieldGroup<T>(fields);
}

export function fieldArray<T extends I[], I>(fieldFactory: () => ExtractFormField<I>): FormFieldArray<T, I> {
  return new FormFieldArray<T, I>(fieldFactory);
}
