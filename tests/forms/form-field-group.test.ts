import { expect, test } from "vitest";
import {field, fieldGroup} from "@/forms";

test("formFieldGroup.value", () => {
  const form = fieldGroup<{ b: boolean }>({
    b: field<boolean>({
      defaultValue: false,
    }),
  });

  const value = form.value;

  expect(value).toMatchObject({ b: false });
})
