import {StringMap} from "@lib/utils/core-utils";

export class Properties {
  private readonly _data: StringMap = {};

  get<T = any>(name: string): T {
    return this._data[name];
  }

  set(name: string, value: any): this {
    this._data[name] = value;
    return this;
  }
}
