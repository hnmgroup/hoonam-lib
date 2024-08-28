import { expect, test } from "vitest";
import {phone, mobile, compose, required, telephone} from "@/validation";

test("phone validator works properly", () => {
  const validator = mobile("IR");
  const comp = compose<string>([required(), compose([mobile("IR"), telephone("IR")])]);

  const result = comp.test("9178525656");

  expect(validator.test("9172223840")).toBeTruthy();
  expect(validator.test("9172")).toBeFalsy();
})
