import { expect, test } from "vitest";
import {uniq} from "lodash-es";

test("function default value", () => {
  expect(hello()).toBe("Hello NoName");
  expect(hello(undefined)).toBe("Hello NoName");
  expect(hello(null)).toBe("Hello null");
})

test("lodash uniq func works properly", () => {
  const u1 = uniq([1, '2', null, 1, undefined]);

  expect(u1.length).toBe(4);
})

function hello(name = "NoName"): string {
  return `Hello ${name}`;
}
