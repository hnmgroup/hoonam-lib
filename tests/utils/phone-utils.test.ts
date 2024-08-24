import { expect, test } from "vitest";
import {formatPhone} from "@/utils/phone-utils";

test("phone utils works properly", () => {
  const p = formatPhone("09179018524", undefined, "fa-IR");

  expect(p).toBe("");
})
