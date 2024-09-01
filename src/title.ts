import { useHead } from "@unhead/vue"
import {nonEmpty} from "@/utils/string-utils";
import {ref} from "vue";

export class Title {
  private _title = ref("");
  private _mainTitle = "";
  private _subTitle = "";
  private _separator = " - ";

  get mainTitle() { return this._mainTitle; }

  get subTitle() { return this._subTitle; }

  get title() {
    return [this._subTitle, this._mainTitle]
      .filter(nonEmpty)
      .join(this._separator);
  }

  constructor() {
    useHead({ title: this._title });
  }

  setSeparator(separator: string): void {
    this._separator = separator ?? "";
    this.updateTitle();
  }

  setMainTitle(title: string): void {
    this._mainTitle = title ?? "";
    this.updateTitle();
  }

  public setSubTitle(subtitle: string): void {
    this._subTitle = subtitle ?? "";
    this.updateTitle();
  }

  public setTitle(title: string): void {
    this._mainTitle = title ?? "";
    this._subTitle = "";
    this.updateTitle();
  }

  private updateTitle(): void {
    this._title.value = this.title;
  }
}
