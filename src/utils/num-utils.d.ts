/* extensions */
export {}
declare global {
  interface Number {
    isBetween(min: number, max: number, mode?: boolean | "[)" | "(]" | "[]" | "()"): boolean;
    format(locale?: string): string;
    percent(percent: number): number;
  }
}
