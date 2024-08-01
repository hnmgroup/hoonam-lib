import {AutoSelectDirective} from "@/directives";

export {}

declare module "@vue/runtime-core" {
  interface ComponentCustomProps  {
    "v-auto-select"?: typeof AutoSelectDirective;
  }
}
