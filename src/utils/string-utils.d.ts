import {Optional} from "@/utils/core-utils";

/* extensions methods */
export {}
declare global {
  interface String {
    startsWithIgnoreCase(searchString: string, position?: number): boolean;
    stripPrefix(str: string): string;
    stripSuffix(str: string): string;
    toChars(): string[];
    toInt(): Optional<number>;
    toFloat(): Optional<number>;
    toDateTime(): Optional<Date>;
    equals(other: Optional<string>, ignoreCase?: boolean): boolean;
    sanitize(trim?: boolean, arabicKafYa?: boolean): Optional<string>;
    format(args: object|any[]): string;
    equalsIgnoreCase(other: Optional<string>): boolean;
  }
}
