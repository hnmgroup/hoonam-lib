import {expect, it, describe, test} from "vitest";
import "@/utils/core-utils";
import {enumInfo, omitEmpty, omit} from "@/utils/core-utils";
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
  const info = enumInfo<Color>(Color);

  expect(info.nameOf(Color.Blue)).toBe("Blue");
  expect(info.titleOf(Color.Blue)).toBe("Blue");
  expect(info.of(Color.Blue)).toMatchObject({name: "Blue", value: 1, title: "Blue"});
  expect(info.isDefined(Color.Blue)).toBeTruthy();
  expect(info.isDefined(Color.Blue + 100)).toBeFalsy();
  expect(info.names).toEqual(["Blue", "Red", "Green"]);
  expect(info.values).toEqual([1, 2, 5]);
  expect(info.underlyingType).toBe("number");
})

test("toEnum works properly", () => {
  expect((2).toEnum<Color>(Color)).toBe(Color.Red);
  expect(() => (0).toEnum(Color)).toThrow();
  expect("Orange".toEnum(Fruit)).toBe(Fruit.Orange);
  expect(() => "orange".toEnum(Fruit)).toThrow();
})

enum Color {
  Blue  = 1,
  Red   = 2,
  Green = 5,
}

enum Fruit {
  Banana = "Banana",
  Apple  = "Apple",
  Orange = "Orange",
}

test("toPromise works properly", () => {
  const observable = of(true).pipe(
    mergeMap(r => r ? of("OK") : throwError(() => new Error("invalid result"))),
  );

  const ps = toPromise(observable);

  expect(ps).instanceof(Promise);
})

test("omit function works properly", () => {
  const obj = omit({a:1,b:2,c:3}, "a", "b");

  expect(obj).not.toHaveProperty(["a", "b"]);
})
