import { expect, test } from "vitest";
import {phone} from "@/validation";

test("phone validator works properly", () => {
  const validator = phone("IR");

  const isValid = validator.test("0");

  expect(isValid).toBeFalsy();
})
