import {
  Axios,
  AxiosError,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig,
  ResponseType as axResponseType
} from "axios";
import {from, isObservable, map, Observable} from "rxjs";
import {isPresent, Optional, StringMap, submitForm, transform} from "@/utils/core-utils";
import {isArray} from "lodash-es";
import {joinUrl} from "@/utils/route-utils";
import axios from "axios";
import {ObservableArray} from "@/utils/observable-array";
import {toPromise} from "@/utils/observable-utils";

type ResponseType = axResponseType;

export const StatusCode = HttpStatusCode;

export class HttpClient {
  private readonly axios: Axios = axios.create();
  private readonly interceptors = new ObservableArray<HttpInterceptor>();

  get defaults(): RequestConfig {
    return this.axios.defaults;
  }

  get baseUrl(): Optional<string> {
    return this.axios.defaults?.baseURL;
  }

  withBaseUrl(url: RequestURL): HttpClient {
    this.axios.defaults.baseURL = this.resolveUrl(url);
    return this;
  }

  constructor(baseUrl?: RequestURL, interceptors?: Iterable<HttpInterceptor>) {
    if (isPresent(baseUrl))
      this.axios.defaults.baseURL = this.resolveUrl(baseUrl);

    if (interceptors) for (const interceptor of interceptors) {
      this.addInterceptor(interceptor);
    }
  }

  private addInterceptor(i: HttpInterceptor): void {
    if (i.type == "Request")
      this.axios.interceptors.request.use(i.interceptor[0], i.interceptor[1]);
    else if (i.type == "Response")
      this.axios.interceptors.response.use(i.interceptor[0], i.interceptor[1]);
    else
      return;
    this.interceptors.push(i);
  }

  private removeInterceptor(i: HttpInterceptor): void {
    if (i.type == "Request")
      this.axios.interceptors.request.eject(i.id);
    else if (i.type == "Response")
      this.axios.interceptors.response.eject(i.id);
    else
      return;
    this.interceptors.remove(i);
  }

  clone(baseUrl?: RequestURL, options?: { inheritInterceptors?: boolean }): HttpClient {
    const instance = new HttpClient(baseUrl ?? this.baseUrl, this.interceptors);
    if (options?.inheritInterceptors) {
      this.interceptors.change.subscribe((change) => {
        if (change.action == "add") instance.addInterceptor(change.item);
        if (change.action == "remove") instance.removeInterceptor(change.item);
      });
    }
    return instance;
  }

  get<T = any>(url: RequestURL, params?: StringMap, headers?: StringMap): Observable<T> {
    return from(
      this.axios.get<T>(this.resolveUrl(url), {params, headers})
    ).pipe(
      map(this.getResponseData)
    );
  }

  post<T = void>(
    url: RequestURL,
    data?: any,
    params?: StringMap,
    headers?: StringMap,
    responseType?: ResponseType,
  ): Observable<T> {
    return from(
      this.axios.post<T>(this.resolveUrl(url), data, {params, headers, responseType})
    ).pipe(
      map(this.getResponseData)
    );
  }

  postForm<T = void>(url: RequestURL, data?: any, headers?: StringMap): Observable<T> {
    return from(
      this.axios.postForm<T>(this.resolveUrl(url), data, {headers})
    ).pipe(
      map(this.getResponseData)
    );
  }

  submitForm(url: RequestURL, data: any): void {
    submitForm(this.resolveUrl(url), data);
  }

  put<T = void>(url: RequestURL, data?: any, params?: StringMap): Observable<T> {
    return from(
      this.axios.put<T>(this.resolveUrl(url), data, {params})
    ).pipe(
      map(this.getResponseData)
    );
  }

  patch<T = void>(url: RequestURL, data?: any, params?: StringMap): Observable<T> {
    return from(
      this.axios.patch<T>(this.resolveUrl(url), data, {params})
    ).pipe(
      map(this.getResponseData)
    );
  }

  delete<T = void>(url: RequestURL, params?: StringMap): Observable<T> {
    return from(
      this.axios.delete<T>(this.resolveUrl(url), {params})
    ).pipe(
      map(this.getResponseData)
    );
  }

  private resolveUrl(url: RequestURL): string {
    if (isArray(url)) return joinUrl(...url);
    return joinUrl(url);
  }

  private getResponseData<T = any>(response: AxiosResponse<T>): Optional<T> {
    return response.status == HttpStatusCode.NoContent || response.status == HttpStatusCode.ResetContent
      ? undefined
      : response.data;
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

    const id = this.axios.interceptors.response.use(onFulfill, onRejected);

    this.interceptors.push({
      id,
      type: "Response",
      interceptor: [onFulfill, onRejected],
    });
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

    const id = this.axios.interceptors.request.use(onFulfill, onRejected);

    this.interceptors.push({
      id,
      type: "Request",
      interceptor: [onFulfill, onRejected],
    });
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

interface HttpInterceptor {
  id: number;
  type: "Request"|"Response";
  interceptor: [onFulfill: any, onRejected: any];
}

type RequestURL = string | any | any[];

export interface HttpError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly response?: {
    readonly data: any;
    readonly status: number;
    readonly statusText: string;
  };
  readonly cause?: Error;
}

export function isHttpError(error: any): error is HttpError {
  return error instanceof AxiosError;
}
