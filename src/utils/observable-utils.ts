import {BehaviorSubject, catchError, EMPTY, map, Observable, OperatorFunction, Subject} from "rxjs";
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

export class EventEmitter<T = void> extends Subject<T> {
  get event(): Event<T> { return this.asObservable(); }

  emit(value: T) {
    super.next(value);
  }
}

export class Event<T = void> extends Observable<T> {
}

export function unit(): OperatorFunction<any, void> {
  return map(() => VOID);
}

function toPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    observable.pipe(
      catchError((error) => empty(() => reject(error)))
    ).subscribe((result) =>
      resolve(result)
    );
  });
}

export function fromObservable<T>(observable: Observable<T>, defaultValue?: T): Readonly<Ref<T>> {
  const reactive = observable instanceof BehaviorSubject || observable instanceof ValuedSubject
    ? ref<T>(observable.value) as Ref<T>
    : !isUndefined(defaultValue) ? ref<T>(defaultValue) as Ref<T> : ref<T>();
  observable.subscribe(nextValue => reactive.value = nextValue);
  return reactive;
}

export function empty(action?: () => unknown): typeof EMPTY {
  action?.();
  return EMPTY;
}

/* extensions methods */
export {}
declare module "rxjs" {
  interface Observable<T> {
    asPromise(): Promise<T>;
  }
}

Observable.prototype.asPromise = function <T> (): Promise<T> {
  return toPromise(this);
};
