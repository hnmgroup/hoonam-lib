import { expect, test } from "vitest";
import {formatNumber} from "@/utils/num-utils";

test("numberFormat works properly", () => {
  const currency = formatNumber(100, "c", "fa-IR");
  const bin = formatNumber(0b1001, "b", "fa-IR");
  const binPad = formatNumber(0b1001, "b6", "fa-IR");
  const hex = formatNumber(0x6da5, "x", "fa-IR");
  const hexPad = formatNumber(0x6da5, "x6", "fa-IR");
  const hexU = formatNumber(0x6da5, "X", "fa-IR");
  const num = formatNumber(1234, "n", "fa-IR");
  const percent = formatNumber(10, "p", "fa-IR");
  const percentP = formatNumber(10.755, "p2", "fa-IR");
  const percentExact = formatNumber(1234, "pe", "fa-IR");

  expect(currency).toBe("۱۰۰ ریال");
  expect(bin).toBe("1001");
  expect(binPad).toBe("001001");
  expect(hex).toBe("6da5");
  expect(hexPad).toBe("006da5");
  expect(hexU).toBe("6DA5");
  expect(num).toBe("۱٬۲۳۴");
  expect(percent).toBe("۱٬۰۰۰٪");
  expect(percentP).toBe("۱٬۰۷۵٫۵۰٪");
  expect(percentExact).toBe("۱٬۲۳۴٪");
})
