/* extensions */
export {}
declare global {
  interface String {
    toBoolean(): boolean | undefined;
  }
}
