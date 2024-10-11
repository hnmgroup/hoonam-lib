export class GeoLocation {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
  ) {}

  toString(): string {
    return `${this.latitude},${this.longitude}`;
  }
}
