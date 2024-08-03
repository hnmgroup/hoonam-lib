import {Directive} from "vue";

export {}
declare module "@vue/runtime-core" {
  interface ComponentCustomProps  {
    "v-form-field"?: Directive;
  }
}
