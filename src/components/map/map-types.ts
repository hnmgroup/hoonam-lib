import {GeoLocation} from "@/utils/geo-location";

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface SearchAddressResult {
  readonly formatted: string;
}

export interface SelectedLocationInfo {
  readonly location: GeoLocation;
  readonly address?: SearchAddressResult;
  readonly coveredArea?: boolean;
}

export interface NeshanMapInstance {
  selectCurrentLocation(): void;
}
