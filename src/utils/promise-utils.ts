import {from, Observable} from "rxjs";

function toObservable<T>(promise: Promise<T>): Observable<T> {
  return from(promise);
}

/* extensions methods */
export {}
declare global {
  interface Promise<T> {
    run(): void;
    toObservable(): Observable<T>;
  }
}

Promise.prototype.run = function (): void {
  this.then();
};

Promise.prototype.toObservable = function <T> (): Observable<T> {
  return toObservable(this);
};
