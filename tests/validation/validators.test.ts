import { expect, test } from "vitest";
import {phone, mobile} from "@/validation";

test("phone validator works properly", () => {
  const validator = mobile("IR");

  expect(validator.test("9172223840")).toBeTruthy();
  expect(validator.test("9172")).toBeFalsy();
})
