import {BehaviorSubject, EMPTY, map, Observable, OperatorFunction, Subject} from "rxjs";
import {VOID} from "@/utils/core-utils";
import {ref, Ref} from "vue";
import {isUndefined} from "lodash-es";

export class ValuedSubject<T> extends Subject<T> {
  private _value: T;

  constructor(value?: T) {
    super();
    this._value = value;
  }

  get value() {
    return this._value;
  }

  override next(value: T) {
    this._value = value;
    super.next(value);
  }
}

export function unit<T>(): OperatorFunction<T, void> {
  return map(() => VOID);
}

export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    observable.subscribe({
      next: (value) => resolve(value),
      error: (err) => reject(err),
      complete: () => resolve(undefined),
    });
  });
}

export function observableRef<T>(observable: Observable<T>, defaultValue?: T): Readonly<Ref<T>> {
  const reactive = observable instanceof BehaviorSubject || observable instanceof ValuedSubject
    ? ref<T>(observable.value) as Ref<T>
    : !isUndefined(defaultValue) ? ref<T>(defaultValue) as Ref<T> : ref<T>();
  observable.subscribe(nextValue => reactive.value = nextValue);
  return reactive;
}

export function empty(action?: () => any): typeof EMPTY {
  action?.();
  return EMPTY;
}
