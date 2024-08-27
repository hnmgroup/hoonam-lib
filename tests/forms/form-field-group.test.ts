import { expect, test } from "vitest";
import {field, fieldGroup} from "@/forms";
import {digitOnly, required} from "@/validation";

test("formFieldGroup.value", () => {
  const form = fieldGroup<FormModel>({
    name: field<string>({
      validator: [required()],
    }),
    code: field<string>({
      validator: [digitOnly()],
    }),
  }, { name: "form" });

  form.validate();
  form.validate();

  expect(form.invalid).toBeTruthy();
  expect(form.errors.length).toBe(1);
  expect(form.fields.code.fullName).toBe("form.code");
})

interface FormModel {
  name: string;
  code?: string;
}
