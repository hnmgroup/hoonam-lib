import {each, groupBy, isFunction, orderBy, values, take} from "lodash-es";
import {Optional} from "@/utils/core-utils";

export type OrderDirection = "asc" | "desc";
export type OrderField<T> = keyof T;

/* extensions */

Array.prototype.orderBy = function <T> (
  props: OrderField<T> | OrderField<T>[] | ((item: T) => any),
  dirs?: OrderDirection | OrderDirection[],
): T[] {
  return orderBy(this, props, dirs);
};

Array.prototype.tap = function <T> (
  interceptor: (value: T) => void
): T[] {
  each(this, interceptor);
  return this;
};

Array.prototype.groupBy = function <T, TKey extends keyof T> (
  key: TKey | ((item: T) => T[TKey])
): {key: T[TKey]; items: T[]}[] {
  const resolveKey = (item: T) => isFunction(key) ? key(item) : item[key];
  return values(groupBy(this, key)).map(items => ({key: resolveKey(items[0]), items}));
};

Array.prototype.first = function <T> (): Optional<T> {
  return this?.[0];
};

Array.prototype.take = function <T> (n: number): T[] {
  return take(this, n);
};
