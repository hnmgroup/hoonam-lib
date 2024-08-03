import { register as registerFocusDirective } from "./auto-focus/focus.directive";
import { register as registerAutoSelectDirective } from "./auto-select/auto-select.directive";
import {App} from "vue";

export {FocusDirective as vFocus} from "./auto-focus/focus.directive";
export {AutoSelectDirective as vAutoSelect} from "./auto-select/auto-select.directive";

export function registerCommonDirectives(app: App): void {
  registerFocusDirective(app);
  registerAutoSelectDirective(app);
}
