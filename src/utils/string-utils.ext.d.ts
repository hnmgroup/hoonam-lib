/* extensions */
export {}
declare global {
  interface String {
    startsWithIgnoreCase(searchString: string, position?: number): boolean;
    stripPrefix(str: string): string;
    stripSuffix(str: string): string;
    toChars(): string[];
    equals(other: string | undefined, ignoreCase?: boolean): boolean;
    sanitizeDigits(): string | undefined;
    format(args: object | any[]): string;
    isBlank(): boolean;
    nonBlank(): boolean;
    isEmpty(): boolean;
    nonEmpty(): boolean;
    insert(start: number, newStr: string): string;
    left(length: number): string;
    right(length: number): string;
    /** trim string, then if empty returns undefined */
    trims(): string | undefined;
    trimStart(): string;
    trimEnd(): string;
  }
}
