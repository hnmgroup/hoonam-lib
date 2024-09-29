import { expect, test } from "vitest";
import {phone, mobile, compose, required, telephone, min} from "@/validation";

test("phone validator works properly", () => {
  const validator = mobile("IR");
  const comp = compose<string>([required(), compose([mobile("IR"), telephone("IR")])]);

  const result = comp.test("9178525656");

  expect(validator.test("9172223840")).toBeTruthy();
  expect(validator.test("9172")).toBeFalsy();
})

test("min validator works properly", () => {
  const validator = min(10);

  const result = validator.test("80" as any);

  expect(result).toBeTruthy();
})
