import {Directive} from "vue";

export {}

declare module "@vue/runtime-core" {
  interface ComponentCustomProps  {
    "v-auto-select"?: Directive;
  }
}
