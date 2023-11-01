import {AutoSelectDirective} from "./auto-select.directive";

export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProps  {
    'v-auto-select'?: typeof AutoSelectDirective;
  }
}
