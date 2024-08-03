import {cloneDeep, get} from "lodash-es";
import {Optional, StringMap} from "@/utils/core-utils";
import {isEmpty} from "@/utils/string-utils";

export abstract class Configuration<T = StringMap> {
  private readonly _values: T;

  constructor(
    readonly isProduction: boolean,
    readonly defaultLocale: string,
    values: T,
  ) {
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
