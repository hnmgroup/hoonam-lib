import { expect, test } from "vitest";
import {formatNationalCode, parseNationalCode} from "@/utils/national-code-utils";

test("valid national codes parsed properly", () => {
  expect(parseNationalCode("1001116")).toBe("0001001116");
  expect(parseNationalCode("51088878")).toBe("0051088878");
  expect(parseNationalCode("918084271")).toBe("0918084271");
  expect(parseNationalCode("5355976212")).toBe("5355976212");
})

test("invalid national codes returns undefined", () => {
  expect(parseNationalCode("")).toBeUndefined();
  expect(parseNationalCode("abcdefghij")).toBeUndefined();
  expect(parseNationalCode("1234567890")).toBeUndefined();
})

test("national code format works properly", () => {
  expect(formatNationalCode("1001116", "s")).toBe("0001001116");
  expect(formatNationalCode("۱۰۰۱۱۱۶", "s")).toBe("0001001116");
  expect(formatNationalCode("1001116", "n")).toBe("1001116");
  expect(formatNationalCode("0001001116", "n")).toBe("1001116");
})
