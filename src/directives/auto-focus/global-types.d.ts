import {FocusDirective} from "./focus.directive";

export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProps  {
    'v-focus'?: typeof FocusDirective;
  }
}
