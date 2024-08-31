import {BehaviorSubject, EMPTY, map, Observable, OperatorFunction, Subject} from "rxjs";
import {VOID} from "@/utils/core-utils";
import {getCurrentInstance, onUnmounted, shallowReadonly, ShallowRef, shallowRef, triggerRef} from "vue";
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

export function observableRef<T>(
  observable: Observable<T>,
  initialValue?: T,
  forceUpdate?: boolean,
): Readonly<ShallowRef<T>> {
  const reactive = shallowRef<T>(
    !isUndefined(initialValue) ? initialValue :
    observable instanceof BehaviorSubject ? observable.getValue() :
    observable instanceof ValuedSubject ? observable.value :
    undefined
  );

  const subscription = observable.subscribe((nextValue) => {
     reactive.value = nextValue;
     if (forceUpdate) triggerRef(reactive);
  });

  if (getCurrentInstance()) {
    onUnmounted(() => subscription.unsubscribe());
  }

  return shallowReadonly(reactive);
}

export function empty(action?: () => any): typeof EMPTY {
  action?.();
  return EMPTY;
}
