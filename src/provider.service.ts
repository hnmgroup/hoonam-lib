import { assign } from "lodash-es";
import { getOrElse, isAbsent, isPresent } from "@/utils/core-utils";

const SERVICE_SYMBOL = Symbol();

const registry = new Array<ServiceDescriptor>();
const services = new Map<ServiceDescriptor, any>();

export function registerFactory(
  type: ServiceType,
  factory: (...args: any[]) => any,
  options?: ServiceRegistrationOptions): void {

  function resolveDependency(dependency: any): any {
    return dependency instanceof ValueDependency
      ? dependency.value
      : resolve(dependency);
  }

  function instanceFactory() {
    const args = (options?.deps ?? []).map(dependency => resolveDependency(dependency));
    return factory(...args);
  }

  const registration: ServiceDescriptor = {
    factory: instanceFactory,
    shared: options?.shared
  };

  type[SERVICE_SYMBOL] = registration;
  registry.push(registration);
}

export function registerInstance(type: ServiceType, instance: any, options?: ServiceRegistrationOptions): void {
  const factory = () => instance;
  const newOptions = assign({}, options, { shared: true });
  registerFactory(type, factory, newOptions);
}

export function registerType(type: ServiceType, concreteType?: ServiceType, options?: ServiceRegistrationOptions): void {
  const serviceConcreteType = concreteType ?? type;
  const factory = (...args: any[]) => new serviceConcreteType(...(args ?? []));
  registerFactory(type, factory, options);
}

export function registerServiceType(type: ServiceType, options?: ServiceRegistrationOptions): void {
  registerType(type, type, options);
}

export function resolve<T>(type: ServiceType, defaultValue?: T): T {
  const descriptor: ServiceDescriptor = type[SERVICE_SYMBOL];

  if (isAbsent(descriptor)) {
    if (isPresent(defaultValue)) return defaultValue;
    throw Error(`no service registered for type: ${type}`);
  }

  if (!getOrElse(descriptor.shared, false)) {
    return descriptor.factory();
  }

  let instance = services.get(descriptor);
  if (instance) return instance;

  instance = descriptor.factory();
  services.set(descriptor, instance);

  return instance;
}

class ServiceDescriptor {
  readonly factory: () => any;
  readonly shared?: boolean;
}

export interface ServiceRegistrationOptions {
  deps?: ServiceType[];
  shared?: boolean;
}

export type ServiceType = any;

class ValueDependency<T = any> {
  constructor(readonly value: T) { }
}

export function arg<T>(value: T): ValueDependency<T> {
  return new ValueDependency(value);
}
