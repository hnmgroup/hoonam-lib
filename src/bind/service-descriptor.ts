import {ServiceType} from "./service-type";
import {ValueDependency} from "./value-dependency";

export class ServiceDescriptor {
  readonly type: ServiceType;
  readonly factory: () => any;
  readonly shared?: boolean;
}

export interface RegistrationOptions {
  deps?: RegistrationDependency[];
  shared?: boolean;
}

export interface TypeRegistrationOptions<T> extends RegistrationOptions {
  to?: ServiceType<T> | ServiceType<T>[];
}

export type RegistrationDependency = ServiceType | ValueDependency;
