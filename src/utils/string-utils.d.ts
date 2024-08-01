/* extensions */
export {}
declare global {
  interface String {
    startsWithIgnoreCase(searchString: string, position?: number): boolean;
    stripPrefix(str: string): string;
    stripSuffix(str: string): string;
    toChars(): string[];
    toInt(): number | undefined;
    toFloat(): number | undefined;
    toDateTime(): Date | undefined;
    toBoolean(): boolean | undefined;
    equals(other: string | undefined, ignoreCase?: boolean): boolean;
    sanitize(
      options?: { trim?: boolean; persianNumbers?: boolean; arabicNumbers?: boolean; arabicLetters?: boolean; }
    ): string | undefined;
    format(args: object | any[]): string;
    isBlank(): boolean;
    nonBlank(): boolean;
    isEmpty(): boolean;
    nonEmpty(): boolean;
    insert(start: number, newStr: string): string;
    trims(): string | undefined;
  }
}
