import { expect, test } from "vitest";
import "@/utils/string-utils";
import "@/utils/string-utils.ext.d";

test("startsWithIgnoreCase works properly", () => {
  const str = "MEHDI";

  const trueResult = str.startsWithIgnoreCase("me");
  const falseResult = str.startsWithIgnoreCase("X");

  expect(trueResult).toBeTruthy();
  expect(falseResult).toBeFalsy();
})
