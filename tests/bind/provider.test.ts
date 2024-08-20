import { expect, test } from "vitest";
import {bindType, bindFactory, resolve, Bind, value} from "@/bind";

test("provider", () => {
  bindType(TestService);
  bindFactory(Integer, (t: TestService) => new Integer(t.code + 10), { deps: [TestService] });

  const test = resolve(TestService);
  const fac = resolve(Integer);

  expect(test).toBeInstanceOf(TestService);
  expect(fac).toBeInstanceOf(Integer);
  expect(fac.value).toBe(110);
})

test("provider bind annotation works properly", () => {
  const test = resolve(BTestService);

  expect(test).toBeInstanceOf(BTestService);
  expect(test.name).toBe("reza");
})

class TestService {
  code = 100;
}

class Integer {constructor(readonly value: number) {}}

@Bind({deps: [value("reza")]})
class BTestService {
  constructor(readonly name: string) {
  }
}
