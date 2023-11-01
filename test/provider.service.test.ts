import { expect, test } from "vitest";
import {registerServiceType, resolve} from "@/provider.service";

test("provider.registerServiceType", () => {
  registerServiceType(TestService);

  const test = resolve(TestService);

  expect(test).toBeInstanceOf(TestService);
})

class TestService { }
