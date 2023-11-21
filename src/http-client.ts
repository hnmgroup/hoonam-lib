import axios, {
  Axios,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig
} from "axios";
import {from, isObservable, map, Observable} from "rxjs";
import {isAbsent, Optional, remove, StringMap, transform} from "@lib/utils/core-utils";
import {assign, isEmpty} from "lodash-es";
import {isBlank} from "@lib/utils/string-utils";
import {toPromise} from "@lib/utils/observable-utils";

export const StatusCode = HttpStatusCode;

export class HttpClient {

  private static readonly interceptors = {
    request: new Array<any[]>(),
    response: new Array<any[]>(),
  };

  static readonly defaults: RequestConfig = {
    headers: {},
    params: {},
  };

  readonly defaults: RequestConfig = {
    headers: {},
    params: {},
  };

  private readonly axios: Axios = axios.create();

  get baseUrl(): string {
    return this.getRequestConfig()?.baseURL;
  }

  constructor(baseUrl?: string) {
    HttpClient.interceptors.request.forEach((args) => this.axios.interceptors.request.use(...args));
    HttpClient.interceptors.response.forEach((args) => this.axios.interceptors.response.use(...args));
    this.defaults.baseUrl = baseUrl;
  }

  setBaseUrl(url: string): this {
    this.defaults.baseUrl = url;
    return this;
  }

  get<T = any>(url: string, params?: StringMap): Observable<T> {
    return from(this.axios.get<T>(url, this.getRequestConfig({params}))).pipe(map(this.getResponseData));
  }

  post<T = void>(url: string, data?: any, headers?: StringMap): Observable<T> {
    return from(this.axios.post<T>(url, data, this.getRequestConfig({headers}))).pipe(map(this.getResponseData));
  }

  postForm<T = void>(url: string, data?: any, headers?: StringMap): Observable<T> {
    return from(this.axios.postForm<T>(url, data, this.getRequestConfig({headers}))).pipe(map(this.getResponseData));
  }

  put<T = void>(url: string, data?: any, params?: StringMap): Observable<T> {
    return from(this.axios.put<T>(url, data, this.getRequestConfig({params}))).pipe(map(this.getResponseData));
  }

  patch<T = void>(url: string, data?: any, params?: StringMap): Observable<T> {
    return from(this.axios.patch<T>(url, data, this.getRequestConfig({params}))).pipe(map(this.getResponseData));
  }

  delete<T = void>(url: string, params?: StringMap): Observable<T> {
    return from(this.axios.delete<T>(url, this.getRequestConfig({params}))).pipe(map(this.getResponseData));
  }

  private getResponseData<T = any>(response: AxiosResponse<T>): Optional<T> {
    return response.status == HttpStatusCode.NoContent || response.status == HttpStatusCode.ResetContent
      ? undefined
      : response.data;
  }

  private getRequestConfig(config?: AxiosRequestConfig): Optional<AxiosRequestConfig> {
    const defaultConfig = this.defaults;
    const globalConfig = HttpClient.defaults;
    const targetConfig: AxiosRequestConfig = {};

    targetConfig.baseURL =
      config?.baseURL ?? defaultConfig.baseUrl ?? globalConfig.baseUrl;

    targetConfig.withCredentials =
      config?.withCredentials ?? defaultConfig.withCredentials ?? globalConfig.withCredentials;

    targetConfig.headers =
      assign({}, globalConfig.headers, defaultConfig.headers, config?.headers);

    targetConfig.params =
      assign({}, globalConfig.params, defaultConfig.params, config?.params);

    remove(targetConfig, "baseURL", isBlank);
    remove(targetConfig, "withCredentials", isAbsent);
    remove(targetConfig, "headers", isEmpty);
    remove(targetConfig, "params", isEmpty);

    return isEmpty(targetConfig) ? undefined : targetConfig;
  }

  useResponseInterceptor(
    onSuccess?: (response: HttpResponse) => HttpResponse | Observable<HttpResponse>,
    onFailure?: (error: any) => any | Observable<any>,
  ): void {

    const onFulfill = transform(onSuccess, (onSuccess) => {
      return (value: AxiosResponse) => {
        const response = onSuccess(value) as (AxiosResponse | Observable<AxiosResponse>);
        return isObservable(response) ? toPromise(response) : response;
      };
    });

    const onRejected = transform(onFailure, (onFailure) => {
      return (error: any) => {
        const response = onFailure(error);
        return isObservable(response) ? toPromise(response) : response;
      };
    });

    this.axios.interceptors.response.use(onFulfill, onRejected);
  }

  useRequestInterceptor(
    onSuccess?: (response: RequestConfig) => RequestConfig | Observable<RequestConfig>,
    onFailure?: (error: any) => any,
  ): void {

    const onFulfill = transform(onSuccess, (onSuccess) => {
      return (value: InternalAxiosRequestConfig) => {
        const request = onSuccess(value) as (InternalAxiosRequestConfig | Observable<InternalAxiosRequestConfig>);
        return isObservable(request) ? toPromise(request) : request;
      };
    });

    const onRejected = transform(onFailure, (onFailure) => {
      return (error: any) => {
        const request = onFailure(error);
        return isObservable(request) ? toPromise(request) : request;
      };
    });

    this.axios.interceptors.request.use(onFulfill, onRejected);
  }

  static useResponseInterceptor(
    onSuccess?: (response: HttpResponse) => HttpResponse | Observable<HttpResponse>,
    onFailure?: (error: any) => any | Observable<any>,
  ): void {

    const onFulfill = transform(onSuccess, (onSuccess) => {
      return (value: AxiosResponse) => {
        const response = onSuccess(value) as (AxiosResponse | Observable<AxiosResponse>);
        return isObservable(response) ? toPromise(response) : response;
      };
    });

    const onRejected = transform(onFailure, (onFailure) => {
      return (error: any) => {
        const response = onFailure(error);
        return isObservable(response) ? toPromise(response) : response;
      };
    });

    HttpClient.interceptors.response.push([onFulfill, onRejected]);
  }

  static useRequestInterceptor(
    onSuccess?: (response: RequestConfig) => RequestConfig | Observable<RequestConfig>,
    onFailure?: (error: any) => any,
  ): void {

    const onFulfill = transform(onSuccess, (onSuccess) => {
      return (value: InternalAxiosRequestConfig) => {
        const request = onSuccess(value) as (InternalAxiosRequestConfig | Observable<InternalAxiosRequestConfig>);
        return isObservable(request) ? toPromise(request) : request;
      };
    });

    const onRejected = transform(onFailure, (onFailure) => {
      return (error: any) => {
        const request = onFailure(error);
        return isObservable(request) ? toPromise(request) : request;
      };
    });

    HttpClient.interceptors.request.push([onFulfill, onRejected]);
  }
}

interface RequestConfig {
  baseUrl?: string;
  withCredentials?: boolean;
  headers?: StringMap;
  params?: StringMap;
}

interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}
