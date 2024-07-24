import {FormFieldDirective} from "./form-field.directive";

export {}
declare module "@vue/runtime-core" {
  interface ComponentCustomProps  {
    "v-form-field"?: typeof FormFieldDirective;
  }
}
