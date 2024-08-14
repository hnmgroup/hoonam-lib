import {OrderDirection, OrderField} from "./array-utils?__target=./index";

/* extensions */
export {}
declare global {
  interface Array<T> {
    orderBy(
      props: OrderField<T> | OrderField<T>[] | ((item: T) => any),
      dirs?: OrderDirection | OrderDirection[]
    ): T[];
    tap(interceptor: (value: T) => void): T[];
    append(...items: T[]): T[];
    prepend(...items: T[]): T[];
    add(item: T): void;
    clear(): void;
    removeAt(index: number): void;
    remove(item: T, strict?: boolean): void;
    except(array: T[]): T[];
    intersect(array: T[]): T[];
    groupBy<TKey extends keyof T>(
      key: TKey | ((item: T) => T[TKey])
    ): {key: T[TKey]; items: T[]}[];
    first(): T | undefined;
    last(): T | undefined;
    take(n: number): T[];
    isEmpty(): boolean;
  }
}
