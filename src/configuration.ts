import "vite/client";
import {cloneDeep, get} from "lodash-es";
import {Optional, StringMap} from "@/utils/core-utils";
import {isEmpty} from "@/utils/string-utils";

export abstract class Configuration<T = StringMap> {
  private readonly _values: T;

  readonly defaultLocale: string;
  readonly isProduction: boolean;

  constructor(values: T) {
    this.isProduction = import.meta.env.PROD ?? false;
    this.defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE;
    this._values = values;
  }

  getValue<T = Optional<any>>(key: string): T {
    const value = cloneDeep(this._values);
    return isEmpty(key) ? value : get(value, key);
  }

  getConfig<T = Optional<StringMap>>(key: string): T {
    return this.getValue<T>(key);
  }
}
