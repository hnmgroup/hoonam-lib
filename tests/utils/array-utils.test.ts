import { expect, test } from "vitest";
import "@/utils/array-utils";

test("append and prepend works properly", () => {
  const array = [1,2,3];

  const prepend = array.prepend(-1, 0);
  const append = array.append(4, 5);

  expect(array).toEqual([1,2,3]);
  expect(prepend).toEqual([-1,0,1,2,3]);
  expect(append).toEqual([1,2,3,4,5]);
})

test("array works properly", () => {
  const objArray = [
    {name: "C#", mark: 20},
    {name: "Java", mark: 15},
    {name: "C++", mark: 16},
  ];

  const sum = objArray.map(o => o.mark).sum();
  const sumo = objArray.sum((o: typeof objArray[0]) => o.mark);
  const sumf = objArray.sum("mark");

  expect(sum).toEqual(51);
  expect(sumo).toEqual(51);
  expect(sumf).toEqual(51);
})
