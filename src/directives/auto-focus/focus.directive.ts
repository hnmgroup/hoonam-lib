import {App, Directive} from "vue";
import {dispatcherInvoke} from "@/utils/core-utils";

export const FocusDirective: Directive<HTMLElement> = {
  mounted(element) {
    dispatcherInvoke(() => element.focus());
  }
};

export function register(app: App): void {
  app.directive('focus', FocusDirective);
}
