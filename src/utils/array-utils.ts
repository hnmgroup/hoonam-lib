import {
  each,
  groupBy,
  isFunction,
  orderBy,
  values,
  take,
  concat,
  remove,
  difference,
  intersection,
  takeRight, findLast, sumBy, drop, dropRight, minBy, maxBy
} from "lodash-es";
import {Optional, FieldOrValue, OrderDirection, OneOrMore} from "@/utils/core-utils";

/* extensions */

Array.prototype.orderBy = function <T> (
  props: OneOrMore<FieldOrValue<T>>,
  dirs?: OneOrMore<OrderDirection>,
): T[] {
  return orderBy(this, props as any, dirs);
};

Array.prototype.tap = function <T> (interceptor: (value: T) => void): T[] {
  each(this, interceptor);
  return this;
};

Array.prototype.append = function <T> (...items: T[]): T[] {
  return concat(this, items);
};

Array.prototype.prepend = function <T> (...items: T[]): T[] {
  return concat(items, this);
};

Array.prototype.filterNot = function <T> (predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  return this.filter((value, index, array) => !predicate(value, index, array));
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
  key: FieldOrValue<T, TKey>
): { key: T[TKey]; items: T[] }[] {
  const resolveKey = (item: T) => isFunction(key) ? key(item) : item[key];
  return values(groupBy(this, key)).map((items: T[]) => ({ key: resolveKey(items[0]) as any, items }));
};

Array.prototype.first = function <T> (): Optional<T> {
  return this.length > 0 ? this[0] : undefined;
};

Array.prototype.last = function <T> (): Optional<T> {
  return this.length > 0 ? this[this.length - 1] : undefined;
};

Array.prototype.findLast = function <T> (predicate: (value: T, index: number, array: T[]) => boolean): T | undefined {
  return findLast(this, (value, index, collection) => predicate(value, index, collection as T[]));
};

Array.prototype.take = function <T> (n: number): T[] {
  return take(this, n);
};

Array.prototype.takeRight = function <T> (n: number): T[] {
  return takeRight(this, n);
};

Array.prototype.drop = function <T> (n: number): T[] {
  return drop(this, n);
};

Array.prototype.dropRight = function <T> (n: number): T[] {
  return dropRight(this, n);
};

Array.prototype.cast = function <U> (): U[] {
  return this as U[];
};

Array.prototype.isEmpty = function (): boolean {
  return this.length == 0;
};

Array.prototype.sum = function <T> (value?: FieldOrValue<T, number>): number | undefined {
  return this.length > 0 ? sumBy(this, value as any) : undefined;
};

Array.prototype.min = function <T> (value?: FieldOrValue<T, number>): number | undefined {
  return this.length > 0 ? minBy(this, value as any) : undefined;
};

Array.prototype.max = function <T> (value?: FieldOrValue<T, number>): number | undefined {
  return this.length > 0 ? maxBy(this, value as any) : undefined;
};
