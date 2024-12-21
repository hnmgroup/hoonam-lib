export class ValueDependency<T = any> {
  constructor(readonly value: T) {
  }
}

export function value<T>(value: T): ValueDependency<T> {
  return new ValueDependency(value);
}
