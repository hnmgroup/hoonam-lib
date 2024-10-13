import {OrderDirection, FieldOrValue, OneOrMore, ArrayIteratee} from "./core-utils?__target=./index";

/* extensions */
export {}
declare global {
  interface Array<T> {
    orderBy(props: OneOrMore<FieldOrValue<T>>, dirs?: OneOrMore<OrderDirection>): T[];
    tap(interceptor: (value: T) => void): T[];
    filterNot(predicate: ArrayIteratee<T, boolean>): T[];
    append(...items: T[]): T[];
    prepend(...items: T[]): T[];
    add(item: T): void;
    clear(): void;
    removeAt(index: number): void;
    remove(item: T, strict?: boolean): void;
    except(array: T[]): T[];
    intersect(array: T[]): T[];
    groupBy<TKey extends keyof T>(key: FieldOrValue<T, TKey>): { key: T[TKey]; items: T[] }[];
    first(): T | undefined;
    last(): T | undefined;
    findLast(predicate: (value: T, index: number, array: T[]) => boolean): T | undefined;
    take(n: number): T[];
    takeRight(n: number): T[];
    drop(n: number): T[];
    dropRight(n: number): T[];
    cast<U>(): U[];
    isEmpty(): boolean;
    sum(value?: FieldOrValue<T, number>): number | undefined;
    max(value?: FieldOrValue<T, number>): number | undefined;
    min(value?: FieldOrValue<T, number>): number | undefined;
  }
}
