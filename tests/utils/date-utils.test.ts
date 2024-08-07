import { expect, test } from "vitest";
import {formatDate} from "@/utils/date-utils";

test("date works properly", () => {
  const ds = formatDate(new Date());

  expect(ds).toBe("2000");
})
