import { expect, test } from "vitest";
import {phone} from "@/validation";

test("phone validator works properly", () => {
  const validator = phone("IR");

  const isValid = validator.test("9172223840");

  expect(isValid).toBeTruthy();
})
