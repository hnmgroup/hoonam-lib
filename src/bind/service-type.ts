import {InjectionToken} from "./injection-token";

export type ContractType<T> = abstract new(...args: any[]) => T;

export type ConcreteType<T> = { new(...args: any[]): T };

export type ServiceType<T = any> = ContractType<T> | ConcreteType<T> | InjectionToken<T>;
