import {FormField} from "./form-field";
import {FormFieldGroup} from "./form-field-group";
import {FormFieldArray} from "./form-field-array";
import {Optional} from "@/utils/core-utils";
import {ValidationRule} from "@/validation";

export type ValueTransformer<T> = (value: T) => T;

type AbstractFormFieldOptions<T> = {
  name?: string;
  validator?: ValidationRule<T>[];
  validateOnChange?: boolean;
};

export type FormFieldOptions<T> = AbstractFormFieldOptions<T> & {
  defaultValue?: Optional<T>;
  transform?: ValueTransformer<T>[];
};

export type FormFieldGroupOptions<T> = AbstractFormFieldOptions<T>;

export type FormFieldArrayOptions<T> = AbstractFormFieldOptions<T[]>;

export type PrimitiveField = string | number | boolean | bigint | Date;

export type ExtractFormField<T> =
  T extends boolean
    ? FormField<boolean>
    : T extends Exclude<PrimitiveField, boolean>
      ? FormField<T>
      : T extends (infer I)[]
        ? FormFieldArray<I>
        : T extends object
          ? FormFieldGroup<T>
          : never;

export type ExtractFormFieldGroup<T extends object> = {
  [Field in keyof T]: ExtractFormField<T[Field]>;
};
