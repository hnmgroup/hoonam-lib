import { expect, it, describe } from "vitest";
import {omitEmpty} from "@/utils/core-utils";

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
