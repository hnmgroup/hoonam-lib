import {App, Directive} from "vue";
import {AbstractFormField} from "../abstract-form-field";

export const FormFieldDirective: Directive<Element, AbstractFormField> = {
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
