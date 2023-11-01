import { expect, test } from "vitest";
import {joinUrl} from "@/utils/route-utils";

test("joinUrl works properly", () => {
  const url = joinUrl('sales', 'invoices', 100, null, 'status', undefined, { filter: null, sort: '+id' }, { sort: '-name' });

  expect(url).toBe('sales/invoices/100/status?sort=%2Bid&sort=-name');
})
