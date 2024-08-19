import {FormField} from "./form-field";
import {FormFieldGroup} from "./form-field-group";
import {FormFieldArray} from "./form-field-array";

export type ValueTransformer<T> = (value: T) => T;

export type PrimitiveField = string | number | boolean | symbol | bigint | Date;

export type ExtractFormField<T> =
  T extends PrimitiveField
    ? FormField<T>
    : T extends (infer I)[]
      ? FormFieldArray<I>
      : T extends object
        ? FormFieldGroup<T>
        : never;

export type ExtractFormFieldGroup<T extends object> = {
  [Field in keyof T]: ExtractFormField<T[Field]>;
};
