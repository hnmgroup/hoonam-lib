/* extensions */
export {}
declare module "rxjs" {
  interface Observable<T> {
    asPromise(): Promise<T>;
  }
}
