import { expect, test } from "vitest";
import {FormField, FormFieldGroup} from "@/forms";

test("formFieldGroup.value", () => {
  const form = new FormFieldGroup<{ b: boolean }>({
    b: new FormField<boolean>({
      defaultValue: false
    })
  });

  const value = form.value;

  expect(value).toMatchObject({ b: false });
})
