/* extensions */
export {}
declare global {
  interface Number {
    isBetween(min: number, max: number, mode?: boolean | "[)" | "(]" | "[]" | "()"): boolean;
    format(format?: string, locale?: string): string;
    percent(percent: number): number;
    pow(power: number): number;
    trunc(): number;
    ceil(): number;
    floor(): number;
    round(): number;
    fround(): number;
    abs(): number;
    exp(): number;
  }

  interface String {
    toInt(radix?: number): number | undefined;
    toFloat(): number | undefined;
  }
}
