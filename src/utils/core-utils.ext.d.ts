import {Enum} from "./core-utils?__target=./index";

/* extensions */
export {}
declare global {
  interface String {
    toBoolean(): boolean;
    toEnum<T extends string = string>(enumType: Enum): T;
  }

  interface Number {
    toEnum<T extends number = number>(enumType: Enum): T;
  }
}
