import {NumberToWordsOptions} from "./num-utils?__target=./index";

/* extensions */
export {}
declare global {
  interface Number {
    isBetween(min: number, max: number, mode?: boolean | "[)" | "(]" | "[]" | "()"): boolean;
    compareTo(other: number|undefined): number;
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
    toWords(locale?: string, options?: NumberToWordsOptions): string;
    toKB(): number;
    toMB(): number;
    toGB(): number;
    ofKB(): number;
    ofMB(): number;
    ofGB(): number;
  }

  interface String {
    toInteger(radix?: number): number;
    toNumber(): number;
  }
}
