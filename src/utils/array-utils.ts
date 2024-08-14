import {each, groupBy, isFunction, orderBy, values, take, concat, remove, difference, intersection} from "lodash-es";
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

Array.prototype.append = function <T> (...items: T[]): T[] {
  return concat(this, items);
};

Array.prototype.prepend = function <T> (...items: T[]): T[] {
  return concat(items, this);
};

Array.prototype.add = function <T> (item: T): void {
  this.push(item);
};

Array.prototype.clear = function (): void {
  remove(this, () => true);
};

Array.prototype.removeAt = function (index: number): void {
  this.splice(index, 1);
};

Array.prototype.remove = function <T> (item: T, strict = false): void {
  strict ? remove(this, (i: T) => i === item) : remove(this, (i: T) => i == item);
};

Array.prototype.except = function <T> (array: T[]): T[] {
  return difference(this, array);
};

Array.prototype.intersect = function <T> (array: T[]): T[] {
  return intersection(this, array);
};

Array.prototype.groupBy = function <T, TKey extends keyof T> (
  key: TKey | ((item: T) => T[TKey])
): {key: T[TKey]; items: T[]}[] {
  const resolveKey = (item: T) => isFunction(key) ? key(item) : item[key];
  return values(groupBy(this, key)).map(items => ({key: resolveKey(items[0]), items}));
};

Array.prototype.first = function <T> (): Optional<T> {
  return this.length > 0 ? this[0] : undefined;
};

Array.prototype.last = function <T> (): Optional<T> {
  return this.length > 0 ? this[this.length - 1] : undefined;
};

Array.prototype.take = function <T> (n: number): T[] {
  return take(this, n);
};

Array.prototype.isEmpty = function (): boolean {
  return this.length == 0;
};
