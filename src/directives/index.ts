import { register as registerFocusDirective } from './auto-focus/focus.directive';
import { register as registerAutoSelectDirective } from './auto-select/auto-select.directive';
import {App} from "vue";

export {FocusDirective} from "./auto-focus/focus.directive";
export {AutoSelectDirective} from "./auto-select/auto-select.directive";

export function registerSharedDirectives(app: App): void {
  registerFocusDirective(app);
  registerAutoSelectDirective(app);
}
