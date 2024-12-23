import {ServiceType, ConcreteType, ContractType} from "./service-type";
import {
  ServiceDescriptor,
  TypeRegistrationOptions,
  RegistrationDependency,
  RegistrationOptions
} from "./service-descriptor";
import {ValueDependency} from "./value-dependency";

const registry = new Map<ServiceType, ServiceDescriptor>();
const sharedInstances = new Map<ServiceDescriptor, any>();

export function bindFactory<T>(
  type: ServiceType<T>,
  factory: (...args: any[]) => T,
  options?: RegistrationOptions,
): void {
  const typeFactory = options?.deps
    ? () => factory(...options.deps.map(resolveDependency))
    : () => factory();
  registry.set(type, { type, factory: typeFactory, shared: options?.shared });
}

export function bindType<T>(type: ConcreteType<T>, options?: TypeRegistrationOptions<T>): void {
  const serviceTypes = options?.to ? (Array.isArray(options.to) ? options.to : [options.to]) : [type];
  const paramTypes = options?.deps ?? [];
  const factory = () => new type(...paramTypes.map(resolveDependency));
  serviceTypes.forEach(serviceType => bindFactory(serviceType, factory, options));
}

export function bindValue<T>(type: ServiceType<T>, instance: T): void {
  bindFactory(type, () => instance, { shared: true });
}

function resolveDependency(dependency: RegistrationDependency): any {
  return dependency instanceof ValueDependency ? dependency.value : resolve(dependency);
}

export function resolve<T>(type: ServiceType<T>, defaultValue?: T): T {
  if (!registry.has(type)) {
    if (arguments.length > 1) return defaultValue;
    throw Error(`no service registered for type: ${type}`);
  }

  const descriptor = registry.get(type);

  if (!descriptor.shared) {
    return descriptor.factory();
  }

  if (sharedInstances.has(descriptor)) {
    return sharedInstances.get(descriptor);
  }

  const instance = descriptor.factory();
  sharedInstances.set(descriptor, instance);

  return instance;
}

export function Bind(options?: TypeRegistrationOptions<any>) {
  return (concreteType: ConcreteType<any>) => bindType(concreteType, options);
}

export function Contract(impl: ConcreteType<any>) {
  return (_: ContractType<any>) => {};
}

export function inject<T>(type: ServiceType<T>): T;
export function inject<TService1, TService2>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>): [TService1, TService2];
export function inject<TService1, TService2, TService3>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>): [TService1, TService2, TService3];
export function inject<TService1, TService2, TService3, TService4>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>): [TService1, TService2, TService3, TService4];
export function inject<TService1, TService2, TService3, TService4, TService5>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>, serviceType5: ServiceType<TService5>): [TService1, TService2, TService3, TService4, TService5];
export function inject<TService1, TService2, TService3, TService4, TService5, TService6>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>, serviceType5: ServiceType<TService5>, serviceType6: ServiceType<TService6>): [TService1, TService2, TService3, TService4, TService5, TService6];
export function inject<TService1, TService2, TService3, TService4, TService5, TService6, TService7>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>, serviceType5: ServiceType<TService5>, serviceType6: ServiceType<TService6>, serviceType7: ServiceType<TService7>): [TService1, TService2, TService3, TService4, TService5, TService6, TService7];
export function inject<TService1, TService2, TService3, TService4, TService5, TService6, TService7, TService8>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>, serviceType5: ServiceType<TService5>, serviceType6: ServiceType<TService6>, serviceType7: ServiceType<TService7>, serviceType8: ServiceType<TService8>): [TService1, TService2, TService3, TService4, TService5, TService6, TService7, TService8];
export function inject<TService1, TService2, TService3, TService4, TService5, TService6, TService7, TService8, TService9>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>, serviceType5: ServiceType<TService5>, serviceType6: ServiceType<TService6>, serviceType7: ServiceType<TService7>, serviceType8: ServiceType<TService8>, serviceType9: ServiceType<TService9>): [TService1, TService2, TService3, TService4, TService5, TService6, TService7, TService8, TService9];
export function inject<TService1, TService2, TService3, TService4, TService5, TService6, TService7, TService8, TService9, TService10>(serviceType1: ServiceType<TService1>, serviceType2: ServiceType<TService2>, serviceType3: ServiceType<TService3>, serviceType4: ServiceType<TService4>, serviceType5: ServiceType<TService5>, serviceType6: ServiceType<TService6>, serviceType7: ServiceType<TService7>, serviceType8: ServiceType<TService8>, serviceType9: ServiceType<TService9>, serviceType10: ServiceType<TService10>): [TService1, TService2, TService3, TService4, TService5, TService6, TService7, TService8, TService9, TService10];
export function inject(...types: ServiceType[]): any[] {
  return types.length == 1 ? resolve(types[0]) : types.map(t => resolve(t));
}
