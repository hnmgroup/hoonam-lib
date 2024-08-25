import { expect, test } from "vitest";

test("function default value", () => {
  expect(hello()).toBe("Hello NoName");
  expect(hello(undefined)).toBe("Hello NoName");
  expect(hello(null)).toBe("Hello null");
})

function hello(name = "NoName"): string {
  return `Hello ${name}`;
}
