import { expect, test } from "vitest";
import {formatNumber, numberToWordsFa, numberToWordsEn} from "@/utils/num-utils";

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

test("persian number to words works properly", () => {
  expect(numberToWordsFa(0)).toBe("صفر");
  expect(numberToWordsFa(1)).toBe("یک");
  expect(numberToWordsFa(10)).toBe("ده");
  expect(numberToWordsFa(16)).toBe("شانزده");
  expect(numberToWordsFa(100)).toBe("صد");
  expect(numberToWordsFa(1_000)).toBe("هزار");
  expect(numberToWordsFa(1_000_000)).toBe("یک میلیون");
  expect(numberToWordsFa(1_001_000)).toBe("یک میلیون و هزار");
  expect(numberToWordsFa(10_560)).toBe("ده هزار و پانصد و شصت");
  expect(numberToWordsFa(10_060)).toBe("ده هزار و شصت");
  expect(numberToWordsFa(10_000)).toBe("ده هزار");
  expect(numberToWordsFa(10_100)).toBe("ده هزار و صد");
  expect(numberToWordsFa(5_200)).toBe("پنج هزار و دویست");
  expect(numberToWordsFa(1_050)).toBe("هزار و پنجاه");
  expect(numberToWordsFa(2_000_000)).toBe("دو میلیون");
  expect(numberToWordsFa(2_000_000_000)).toBe("دو میلیارد");
  expect(numberToWordsFa(1_001_050)).toBe("یک میلیون و هزار و پنجاه");
  expect(numberToWordsFa(2_001_001_050)).toBe("دو میلیارد و یک میلیون و هزار و پنجاه");
  expect(numberToWordsFa(1_000_000_000_001)).toBe("یک بیلیون و یک");
})

test("persian number to words works properly for negative numbers", () => {
  expect(numberToWordsFa(-1)).toBe("منفی یک");
  expect(numberToWordsFa(-10)).toBe("منفی ده");
  expect(numberToWordsFa(-2_000_000)).toBe("منفی دو میلیون");
})

test("persian number to words works properly for fractional numbers", () => {
  expect(numberToWordsFa(1.5)).toBe("یک ممیز پنج دهم");
  expect(numberToWordsFa(1.05)).toBe("یک ممیز پنج صدم");
  expect(numberToWordsFa(1.005)).toBe("یک ممیز پنج هزارم");
  expect(numberToWordsFa(1.0_005)).toBe("یک ممیز پنج ده‌هزارم");
  expect(numberToWordsFa(1.00_005)).toBe("یک ممیز پنج صدهزارم");
  expect(numberToWordsFa(1.000_005)).toBe("یک ممیز پنج میلیونم");
  expect(numberToWordsFa(1.0_000_005)).toBe("یک ممیز پنج ده‌میلیونم");
  expect(numberToWordsFa(1.00_000_005)).toBe("یک ممیز پنج صدمیلیونم");
  expect(numberToWordsFa(1.000_000_005)).toBe("یک ممیز پنج میلیاردم");
  expect(numberToWordsFa(1.0_000_000_005)).toBe("یک ممیز پنج ده‌میلیاردم");
  expect(numberToWordsFa(1.00_000_000_005)).toBe("یک ممیز پنج صدمیلیاردم");
  expect(numberToWordsFa(1.000_000_000_005)).toBe("یک ممیز پنج بیلیونم");
})

test("english number to words works properly", () => {
  expect(numberToWordsEn(0)).toBe("Zero");
  expect(numberToWordsEn(1)).toBe("One");
  expect(numberToWordsEn(10)).toBe("Ten");
  expect(numberToWordsEn(16)).toBe("Sixteen");
  expect(numberToWordsEn(26)).toBe("Twenty-six");
  expect(numberToWordsEn(26, { baseSeparator: false })).toBe("Twenty Six");
  expect(numberToWordsEn(100)).toBe("One Hundred");
  expect(numberToWordsEn(1_000)).toBe("One Thousand");
  expect(numberToWordsEn(1_000_000)).toBe("One Million");
  expect(numberToWordsEn(1_001_000)).toBe("One Million One Thousand");
  expect(numberToWordsEn(10_560)).toBe("Ten Thousand Five Hundred Sixty");
  expect(numberToWordsEn(10_060)).toBe("Ten Thousand Sixty");
  expect(numberToWordsEn(10_000)).toBe("Ten Thousand");
  expect(numberToWordsEn(10_100)).toBe("Ten Thousand One Hundred");
  expect(numberToWordsEn(5_200)).toBe("Five Thousand Two Hundred");
  expect(numberToWordsEn(1_050)).toBe("One Thousand Fifty");
  expect(numberToWordsEn(2_000_000)).toBe("Two Million");
  expect(numberToWordsEn(2_000_000_000)).toBe("Two Billion");
  expect(numberToWordsEn(1_001_050)).toBe("One Million One Thousand Fifty");
  expect(numberToWordsEn(2_001_001_050)).toBe("Two Billion One Million One Thousand Fifty");
  expect(numberToWordsEn(1_000_000_000_001)).toBe("One Trillion One");
  expect(numberToWordsEn(1_000_000_000_015)).toBe("One Trillion Fifteen");
})

test("english number to words works properly for negative numbers", () => {
  expect(numberToWordsEn(-1)).toBe("Negative One");
  expect(numberToWordsEn(-10)).toBe("Negative Ten");
  expect(numberToWordsEn(-2_000_000)).toBe("Negative Two Million");
})

test("english number to words works properly for fractional numbers", () => {
  expect(numberToWordsEn(1.5)).toBe("One Point Five Tenth");
  expect(numberToWordsEn(1.05)).toBe("One Point Five Hundredth");
  expect(numberToWordsEn(1.005)).toBe("One Point Five Thousandth");
  expect(numberToWordsEn(1.0_005)).toBe("One Point Five Ten-Thousandth");
  expect(numberToWordsEn(1.00_005)).toBe("One Point Five Hundred-Thousandth");
  expect(numberToWordsEn(1.000_005)).toBe("One Point Five Millionth");
  expect(numberToWordsEn(1.0_000_005)).toBe("One Point Five Ten-Millionth");
  expect(numberToWordsEn(1.00_000_005)).toBe("One Point Five Hundred-Millionth");
  expect(numberToWordsEn(1.000_000_005)).toBe("One Point Five Billionth");
  expect(numberToWordsEn(1.000_000_005, { decimalPoint: "and" })).toBe("One and Five Billionth");
})
