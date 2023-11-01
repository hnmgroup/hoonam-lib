import {App, Directive} from "vue";
import {dispatcherInvoke, isPresent} from "@/utils/core-utils";

const AUTO_SELECT_SYMBOL = Symbol();

export const AutoSelectDirective: Directive<HTMLElement> = {
  mounted(element) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;

    const handler = (e: Event) => dispatcherInvoke(() => (e.target as any).select());
    (element as any)[AUTO_SELECT_SYMBOL] = handler;
    element.addEventListener('focusin', handler);
  },
  beforeUnmount(element) {
    const handler = (element as any)[AUTO_SELECT_SYMBOL];
    if (isPresent(handler)) element.removeEventListener('focusin', handler);
  }
};

export function register(app: App): void {
  app.directive('auto-select', AutoSelectDirective);
}
