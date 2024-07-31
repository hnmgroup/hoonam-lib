import { expect, test } from "vitest";
import {bindFactory, bindType, resolve} from "@/bind";

test("provider", () => {
  bindType(TestService);
  bindFactory(Integer, (t: TestService) => new Integer(t.code + 10), { deps: [TestService] });

  const test = resolve(TestService);
  const fac = resolve(Integer);

  expect(test).toBeInstanceOf(TestService);
  expect(fac).toBeInstanceOf(Integer);
  expect(fac.value).toBe(110);
})

class TestService {
  code = 100;
}

class Integer {constructor(readonly value: number) {}}
