import {RouteLocationRaw, Router} from "vue-router";
import {isPresent, Optional} from "@/utils/core-utils";
import {isObject, isNaN, keys, tap, toString, trim, trimEnd, isString, assign, cloneDeep} from "lodash-es";
import {isBlank, nonEmpty} from "@/utils/string-utils";

export function getUrlQuery(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function getReturnBackRoute(defaultRouteName: string = "Home"): RouteLocationRaw {
  const params = getUrlQuery();
  const defaultRoute = { name: defaultRouteName };
  const callbackRoute = params.has('callback_name') ? { name: params.get('callback_name') } : null;
  const callbackUrl = params.get('callback');
  return callbackRoute ?? callbackUrl ?? defaultRoute;
}

export function returnBack(router: Router, defaultRouteName: string = "Home"): void {
  const route = getReturnBackRoute(defaultRouteName);
  router.push(route).run();
}

export function getRouteUrl(router: Router, route: RouteLocationRaw, absolute = true): string {
  let path = router.resolve(route).href;
  const origin = location.origin;
  if (absolute && !path.startsWithIgnoreCase(origin)) path = origin + path;
  if (!absolute && path.startsWithIgnoreCase(origin)) path = path.substring(origin.length);
  return path;
}

export function openNewPage(route: RouteLocationRaw, router: Router) {
  const url = router.resolve(route).href;
  window.open(url, "_blank");
}

export function joinUrl(...path: (any|object)[]): string {
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
        const value = values[name];
        if (isPresent(value) && !isNaN(value)) result.append(name, toString(value));
      });
      return result;
    }, new URLSearchParams())
    .toString();

  return nonEmpty(params) ? url + '?' + params : url;
}

export function getUrlHash(): URLSearchParams {
  let params = (window.location.hash ?? "").stripPrefix('#');
  return isBlank(params) ? new URLSearchParams() : new URLSearchParams(params);
}

export function setUrlHash(params: URLSearchParams, router: Router): void;
export function setUrlHash(name: string, value: any, router: Router): void;
export function setUrlHash(params: URLSearchParams|string, value?: any, router?: Router): void {
  if (isString(params)) {
    const name = params;
    params = tap(getUrlHash(), p => p.set(name, value));
  }

  params.forEach((value, name, params) => {
    if (isBlank(value)) params.delete(name);
  });

  const paramsStr = (params.toString() ?? "").stripPrefix('#');
  const currParams = (router.currentRoute.value.hash ?? "").stripPrefix('#');

  if (paramsStr != currParams)
    router.push(assign(cloneDeep(router.currentRoute.value), { hash: '#' + paramsStr })).run();
}

export function getUrlHashParam(name: string): Optional<string> {
  return getUrlHash().get(name) ?? undefined;
}
