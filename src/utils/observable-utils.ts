import {BehaviorSubject, catchError, EMPTY, map, Observable, OperatorFunction} from "rxjs";
import {ref, Ref} from "vue";
import {isUndefined} from "lodash-es";
import {VOID} from "@/utils/core-utils";

export function unit(): OperatorFunction<any, void> {
  return map(() => VOID);
}

export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    observable.pipe(catchError((error) => empty(() => reject(error)))).
    subscribe((result) => resolve(result));
  });
}

export function fromObservable<T>(observable: Observable<T>, defaultValue?: T): Ref<T> {
  const reactive: Ref<T> = observable instanceof BehaviorSubject
    ? ref<T>(observable.value) as Ref<T>
    : !isUndefined(defaultValue) ? ref<T>(defaultValue) as Ref<T> : ref<T>();
  observable.subscribe(nextValue => reactive.value = nextValue);
  return reactive;
}

export function empty(action: () => unknown): typeof EMPTY {
  action();
  return EMPTY;
}
