import {expect, it, describe, test} from "vitest";
import {getEnumInfo, omitEmpty} from "@/utils/core-utils";

describe("omitEmpty", () => {

  it("empty object", function () {
    const obj = {
      a: null as number,
      b: undefined as string,
    };

    const result = omitEmpty(obj);

    expect(result).toBeUndefined();
  })

  it("non empty object", function () {
    const obj = {
      a: null as number,
      b: undefined as string,
      c: new Date(),
    };

    const result = omitEmpty(obj);

    expect(result).not.toBeUndefined();
  });
})

test("getEnumInfo works properly", () => {
  const info = getEnumInfo<Color>(Color);

  expect(info).toHaveProperty("Blue");
  expect(info).toHaveProperty("Red");
  expect(info).toHaveProperty("Green");
  expect(info).toHaveProperty("1");
  expect(info).toHaveProperty("2");
  expect(info).toHaveProperty("3");
  expect(info).toHaveProperty("_");
})

enum Color {
  Blue =  1,
  Red =   2,
  Green = 3,
}
