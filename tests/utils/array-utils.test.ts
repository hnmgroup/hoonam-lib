import { expect, test } from "vitest";
import "@/utils/array-utils";

test("array works properly", () => {
  const array = [1,2,3];

  const prepend = (array as any).prepend(-1, 0);
  const append = (array as any).append(4, 5);

  expect(array).toEqual([1,2,3]);
  expect(prepend).toEqual([-1,0,1,2,3]);
  expect(append).toEqual([1,2,3,4,5]);
})
