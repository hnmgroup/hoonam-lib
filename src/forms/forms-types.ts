import {FormField} from "./form-field";
import {FormFieldGroup} from "./form-field-group";
import {FormFieldArray} from "./form-field-array";
import {Optional} from "@/utils/core-utils";
import {ValidationRule} from "@/validation";
import {AbstractFormField} from "./abstract-form-field";

export type FieldValueTransformer<T> =
  ((value: T) => T) |
  { transform(value: T, field: AbstractFormField): T; };

export type AbstractFormFieldOptions<T> = {
  name?: string;
  validator?: ValidationRule<T>[];
  validateOnChange?: boolean;
  transform?: FieldValueTransformer<T>[];
  parent?: AbstractFormField;
  disabled?: boolean | ((field: AbstractFormField) => boolean);
};

export type FormFieldOptions<T> = AbstractFormFieldOptions<T> & {
  defaultValue?: Optional<T>;
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
