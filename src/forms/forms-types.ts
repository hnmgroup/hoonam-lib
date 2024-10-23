import {FormField} from "./form-field";
import {FormFieldGroup} from "./form-field-group";
import {FormFieldArray} from "./form-field-array";
import {Optional, StringMap} from "@/utils/core-utils";
import {ValidationRule} from "@/validation";
import {AbstractFormField} from "./abstract-form-field";

export type FieldValueTransformer<T> =
  ((value: T) => T) |
  { transform(value: T, field: AbstractFormField): T; };

export type AbstractFormFieldOptions<
  T,
  TData extends StringMap = StringMap,
  TOptions extends StringMap = StringMap,
> = {
  name?: string;
  validator?: ValidationRule<T>[];
  validateOnChange?: boolean;
  transform?: FieldValueTransformer<T>[];
  parent?: AbstractFormField;
  disabled?: boolean | ((field: AbstractFormField) => boolean);
  data?: TData;
  options?: TOptions;
};

export type FormFieldOptions<T, TData, TOptions> = AbstractFormFieldOptions<T, TData, TOptions> & {
  defaultValue?: Optional<T>;
};

export type FormFieldGroupOptions<T, TData, TOptions> = AbstractFormFieldOptions<T, TData, TOptions>;

export type FormFieldArrayOptions<T, TData, TOptions> = AbstractFormFieldOptions<T[], TData, TOptions> & {
  uniqueItems?: boolean;
};

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
  [Field in keyof T as T[Field] extends Function ? never : Field]: ExtractFormField<T[Field]>;
};
