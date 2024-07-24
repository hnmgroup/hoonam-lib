import {Optional, StringMap} from "@/utils/core-utils";

export abstract class Configuration {
  readonly apiVersion: Optional<string>;
  readonly apiUrl: string;
  readonly isProduction: boolean;
  readonly defaultLocale: string;
  abstract getConfig<T = Optional<StringMap>>(key: string): T;
  abstract getValue<T = Optional<any>>(key: string): T;
}
