import {values} from "lodash-es";
import {nonEmpty} from "@/utils/string-utils";
import {isAbsent, isPresent, Optional} from "@/utils/core-utils";

export class MetaTag {
  private readonly _ignoreTags = new Set<string>();

  setMetaTags(tags: MetaTagType[], removeRemains: boolean = false): void {

    const metaTags = this.getDocumentMetaTags();

    if (removeRemains) {
      metaTags.forEach(t => {
        const elementKey = this.getMetaElementKey(t);
        if (!tags.some(tag => this.getMetaTagKey(tag) == elementKey)) t.remove();
      });
    }

    tags.forEach(tag => {
      let metaElement = metaTags.find(t => this.getMetaElementKey(t) == this.getMetaTagKey(t));
      if (isAbsent(metaElement)) {
        metaElement = document.createElement("meta");
        const isProperty = isPresent((tag as IMetaTagProp).property);
        if (isProperty) metaElement.setAttribute("property", (tag as IMetaTagProp).property);
        else metaElement.setAttribute("name", (tag as IMetaTag).name);
        metaElement.content = tag.content ?? "";
        document.head.appendChild(metaElement);
      } else {
        metaElement.content = tag.content ?? "";
      }
    });
  }

  ignoreTags(...tags: string[]): this {
    tags.forEach(tag => this._ignoreTags.add(tag));
    return this;
  }

  private getDocumentMetaTags(): HTMLMetaElement[] {
    return values(document.head.getElementsByTagName("meta")).filter(t => {
      const key = this.getMetaElementKey(t);
      const isDataMetaTag = isPresent(key);
      return isDataMetaTag && !this._ignoreTags.has(key);
    });
  }

  private getMetaElementKey(element: HTMLMetaElement): Optional<string> {
    const property = element.getAttribute("property");
    const name = element.getAttribute("name");
    return nonEmpty(property) ? property : nonEmpty(name) ? name : undefined;
  }

  private getMetaTagKey(metaTag: MetaTagType): string {
    return (metaTag as IMetaTagProp).property ?? (metaTag as IMetaTag).name;
  }
}

export type MetaTagType = IMetaTag | IMetaTagProp;

export interface IMetaTag {
  name: string;
  content: string;
}

export interface IMetaTagProp {
  property: string;
  content: string;
}
