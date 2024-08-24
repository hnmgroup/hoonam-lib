import {expect, it, describe, test} from "vitest";
import {getEnumInfo, omitEmpty} from "@/utils/core-utils";
import {mergeMap, of, throwError} from "rxjs";
import {toPromise} from "@/utils/observable-utils";

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

test("toPromise works properly", () => {
  const observable = of(true).pipe(
    mergeMap(r => r ? of("OK") : throwError(() => new Error("invalid result"))),
  );

  const ps = toPromise(observable);

  expect(ps).instanceof(Promise);
})
