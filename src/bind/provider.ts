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
  registry.set(type, {type, factory: typeFactory, shared: options?.shared});
}

export function bindType<T>(
  type: ConcreteType<T>,
  options?: RegistrationOptions & { to?: ServiceType<T> },
): void {
  const serviceType = options?.to ?? type;
  const paramTypes = options?.deps ?? [];
  const factory = () => new type(...paramTypes.map(resolveDependency));
  bindFactory(serviceType, factory, options);
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

export function Bind(options?: Parameters<typeof bindType>[1]) {
  return (concreteType: Parameters<typeof bindType>[0]) => bindType(concreteType, options);
}

export function Contract(impl: ConcreteType<any>) {
  return (_: ContractType<any>) => {};
}

class ServiceDescriptor {
  readonly type: ServiceType;
  readonly factory: () => any;
  readonly shared?: boolean;
}

interface RegistrationOptions {
  deps?: RegistrationDependency[];
  shared?: boolean;
}

type RegistrationDependency = ServiceType | ValueDependency;

type ContractType<T> = abstract new(...args: any[]) => T;

type ConcreteType<T> = { new(...args: any[]): T };

type ServiceType<T = any> = ContractType<T> | ConcreteType<T> | InjectionToken<T>;

class ValueDependency<T = any> {
  constructor(readonly value: T) { }
}

export function value<T>(value: T): ValueDependency<T> {
  return new ValueDependency(value);
}

export class InjectionToken<T> {
  constructor(readonly description?: string) {}
}
