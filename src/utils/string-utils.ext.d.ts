/* extensions */
export {}
declare global {
  interface String {
    startsWithIgnoreCase(searchString: string, position?: number): boolean;
    stripPrefix(str: string): string;
    stripSuffix(str: string): string;
    toChars(): string[];
    toInt(radix?: number): number | undefined;
    toFloat(): number | undefined;
    toDate(): Date | undefined;
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
    /** trim string, then if empty returns undefined */
    trims(): string | undefined;
    trimStart(): string;
    trimEnd(): string;
    formatPhone(countryCode?: string): string;
  }
}
