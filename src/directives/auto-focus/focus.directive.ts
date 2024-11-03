import {App, Directive} from "vue";
import {dispatcherInvoke, Optional} from "@/utils/core-utils";

export const FocusDirective: Directive<HTMLElement, Optional<boolean>> = {
  mounted(element, binding) {
    if (binding.value === false) return;
    dispatcherInvoke(() => element.focus());
  }
};

export function register(app: App): void {
  app.directive("focus", FocusDirective);
}
