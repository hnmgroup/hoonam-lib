export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface NeshanMapInstance {
  selectCurrentLocation(): Promise<void>;
  getCenter(): GeoCoordinate;
}
