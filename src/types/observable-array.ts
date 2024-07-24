import {EventEmitter} from "@/utils/observable-utils";
import { remove } from "lodash-es";

export class ObservableArray<T> implements Iterable<T> {
  private readonly _items: T[] = [];
  private readonly _change = new EventEmitter<{
    readonly action: "add"|"remove";
    readonly item: T;
  }>();

  get change() { return this._change.event; }

  [Symbol.iterator](): Iterator<T> {
    return this._items.values();
  }

  push(item: T): void {
    this._items.push(item);
    this._change.emit({ action: "add", item });
  }

  remove(item: T): void {
    remove(this._items, i => i == item);
    this._change.emit({ action: "remove", item });
  }

  forEach(callback: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
    this._items.slice().forEach(callback, thisArg);
  }
}
