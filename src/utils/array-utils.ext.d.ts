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

    groupBy<TKey extends keyof T>(
      key: TKey | ((item: T) => T[TKey])
    ): {key: T[TKey]; items: T[]}[];

    first(): T | undefined;

    take(n: number): T[];
  }
}
