import { expect, test } from "vitest";
import {formatDate} from "@/utils/date-utils";

test("date works properly", () => {
  const df = formatDate(new Date(), "EEEE dd MMMM yyyy", "fa-IR");

  expect(df).toBeNull();
})
