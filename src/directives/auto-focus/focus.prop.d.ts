import {Directive} from "vue";

export {}

declare module "@vue/runtime-core" {
  interface ComponentCustomProps  {
    "v-focus"?: Directive;
  }
}
