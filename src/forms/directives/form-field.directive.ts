import {App, Directive} from "vue";
import {FormField} from "../form-field";

export const FormFieldDirective: Directive<Element, FormField<any>> = {
  mounted(element, binding) {
    if (binding.value) binding.value.element = element;
  },
  updated(element, binding) {
    if (binding.value) binding.value.element = element;
  }
};

export function register(app: App): void {
  app.directive("form-field", FormFieldDirective);
}
