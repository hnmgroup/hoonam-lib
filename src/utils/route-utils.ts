import {ComponentPublicInstance} from "vue";
import {RouteLocationRaw, Router} from "vue-router";
import {isPresent, Optional} from "@/utils/core-utils";
import {
  isObject,
  isNaN,
  keys,
  tap,
  toString,
  trim,
  trimEnd,
  isString,
  assign,
  cloneDeep,
  isUndefined,
  isNull
} from "lodash-es";
import {isBlank, nonEmpty} from "@/utils/string-utils";

export declare type NavigationGuardNextCallback = (vm: ComponentPublicInstance) => any;
export declare type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean | NavigationGuardNextCallback;

export function getUrlQuery(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function getUrlHash(): URLSearchParams {
  let params = (window.location.hash ?? "").stripPrefix('#');
  return isBlank(params) ? new URLSearchParams() : new URLSearchParams(params);
}

export function getUrlHashParam(name: string): Optional<string> {
  return getUrlHash().get(name) ?? undefined;
}

export function getReturnRoute(defaultRoute: RouteLocationRaw = { name: "Home" }): RouteLocationRaw {
  const params = getUrlQuery();
  const returnRoute = params.has("return") ? { name: params.get("return") } : undefined;
  const returnUrl = params.get("return_url") ?? params.get("returnUrl");
  return returnRoute ?? returnUrl ?? defaultRoute;
}

export function returnBack(router: Router, defaultRoute: RouteLocationRaw = { name: "Home" }): void {
  const route = getReturnRoute(defaultRoute);
  router.push(route).then();
}

export function getRouteUrl(router: Router, route: RouteLocationRaw, absolute = true): string {
  let path = router.resolve(route).href;
  const origin = location.origin;
  if (absolute && !path.startsWithIgnoreCase(origin)) path = origin + path;
  if (!absolute && path.startsWithIgnoreCase(origin)) path = path.substring(origin.length);
  return path;
}

export function openNewPage(router: Router, route: RouteLocationRaw): Window {
  const url = router.resolve(route).href;
  return window.open(url, "_blank");
}

export function joinUrl(...path: (any | object)[]): string {
  const url = path
    .filter(s => isPresent(s))
    .filter(s => !isObject(s) && !isNaN(s))
    .map(s => toString(s).trim())
    .map((s, index) => {
      if (s.includes('?')) return s;
      return index == 0 ? trimEnd(s, '/') : trim(s, '/')
    })
    .filter(v => nonEmpty(v))
    .join('/');

  const params = path
    .filter(s => isPresent(s))
    .filter(s => isObject(s))
    .reduce<URLSearchParams>((result, values) => {
      keys(values).forEach(name => {
        let value = values[name];
        if (isUndefined(value) || !isNaN(value)) return;
        if (isNull(value)) value = "";
        result.append(name, toString(value));
      });
      return result;
    }, new URLSearchParams())
    .toString();

  return nonEmpty(params) ? url + '?' + params : url;
}

export function setUrlHash(router: Router, params: URLSearchParams): void;
export function setUrlHash(router: Router, name: string, value: any): void;
export function setUrlHash(router: Router, paramsOrName: URLSearchParams | string, value?: any): void {
  if (isString(paramsOrName)) {
    const name = paramsOrName;
    paramsOrName = tap(getUrlHash(), p => p.set(name, value));
  }

  paramsOrName.forEach((value, name, params) => {
    if (isUndefined(value)) params.delete(name);
    else if (isNull(value)) params.set(name, "");
  });

  const paramsStr = (paramsOrName.toString() ?? "").stripPrefix('#');
  const currParams = (router.currentRoute.value.hash ?? "").stripPrefix('#');

  if (paramsStr != currParams) {
    router.push(
      assign(cloneDeep(router.currentRoute.value), { hash: '#' + paramsStr })
    ).then();
  }
}

/* extensions */

export function extendRouter(Router: { prototype: Router }): void {

  Router.prototype.returnBack = function (defaultRoute?: RouteLocationRaw): void {
    returnBack(this, defaultRoute);
  };

  Router.prototype.getRouteUrl = function (route: RouteLocationRaw, absolute = true): string {
    return getRouteUrl(this, route, absolute);
  };

  Router.prototype.openInNewPage = function (route: RouteLocationRaw): void {
    openNewPage(this, route);
  };

  Router.prototype.setUrlHash = function (paramsOrName: URLSearchParams | string, value?: any): void {
    setUrlHash(this, paramsOrName as any, value);
  };
}
