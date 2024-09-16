import {RouteLocationRaw} from "vue-router";

/* extensions */
export {}
declare module "vue-router" {
  interface Router {
    returnBack(defaultRoute?: RouteLocationRaw): void;
    getRouteUrl(route: RouteLocationRaw, absolute?: boolean): string;
    openInNewPage(route: RouteLocationRaw): void;
    setUrlHash(params: URLSearchParams): void;
    setUrlHash(name: string, value: any): void;
    goBack(delta?: number): void;
  }
}
