import {Observable} from "rxjs";

/* extensions */
export {}
declare global {
  interface Promise<T> {
    run(): void;
    toObservable(): Observable<T>;
  }
}
