<template>
  <div class="position-relative">
    <div ref="mapElement" class="map-container w-100"
         :class="{'read-only-map': readonlyMode}"
         :style="{'height': mapHeight}">
    </div>

    <a class="position-absolute text-main me-2 bg-white p-1 location-item"
       @click.prevent="gotoCurrentPosition"
       v-show="!readonlyMode">
      <i class="icon-map-location"></i>
    </a>

    <form class="input-group position-absolute text-main top-0 right-0 m-1 w-75"
         style="z-index: 1000;" v-show="!readonlyMode"
         @submit.prevent="searchLocation">
      <input type="text" class="form-control form-control-sm shadow-none"
             inputmode="search" placeholder="جستجو..." v-model="searchText">
      <button type="submit" class="input-group-text bg-white border-start-0 cursor-pointer">
        <i class="bi bi-search icon-size-1x"></i>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {GeoCoordinate, NeshanMapInstance} from "./map-types";
import {onMounted, ref, watch} from "vue";
import {resolve} from "@/provider";
import {Configuration} from "@/configuration";
import {Logger} from "@/logger";
import {isEqual} from "lodash-es";
import {ApplicationError, isAbsent, Optional, getCurrentPosition, VOID, DEFAULT_POSITION, isPresent} from "@/utils/core-utils";
import MapPointerIconUrl from "./map-marker.png";
import {initialize as moduleInitialize, SelectedLocationInfo, SearchAddressResult} from ".";
import {GeoLocation} from "@/types/geo-location";
import {HttpClient} from "@/http-client";
import {mergeMap, of, throwError} from "rxjs";

const logger = resolve(Logger);
const http = resolve(HttpClient);
const config = resolve(Configuration);
const webKey = config.getValue<string>("neshanMap.webKey");
const apiKey = config.getValue<string>("neshanMap.apiKey");
const DefaultCenter: GeoCoordinate = DEFAULT_POSITION;
const DefaultZoom = 14;
const searchText = ref<Optional<string>>();
const mapElement = ref<HTMLElement>();
let map: LeafletMap;
let marker: LeafletMarker;
let coverageArea: LeafletPolygon;
let zoomControl: LeafletZoomControl;

const props = withDefaults(defineProps<{
  modelValue?: GeoCoordinate;
  zoom?: number;
  mapHeight?: string;
  readonlyMode?: boolean;
  coverageRestrict?: boolean;
  retrieveAddress?: boolean;
}>(), {
  mapHeight: "450px",
  coverageRestrict: true,
  retrieveAddress: true,
});

watch(
  () => props.readonlyMode,
  (readonly) => setReadonlyMode(readonly)
);
watch(
  () => props.modelValue,
  (location) => setCenter(location)
);

const emit = defineEmits<{
  (e: "update:modelValue", location: GeoCoordinate): void,
  (e: "update:zoom", zoom: number): void,
  (e: "locationSelect", result: SelectedLocationInfo): void,
}>();

function initialize(): void {
  const L = (window as any)["L"];

  map = new L.Map(mapElement.value, {
    key: webKey,
    maptype: "dreamy",
    poi: true,
    traffic: false,
    center: toLeafletCoordinate(props.modelValue ?? DefaultCenter),
    zoom: props.zoom ?? DefaultZoom
  });
  zoomControl = map.zoomControl;
  map.on("moveend", () => emit("update:modelValue", getCenter()));
  map.on("zoomend", () => emit("update:zoom", getZoom()));
  addLayers(map);
  setReadonlyMode(props.readonlyMode);
}

function toLeafletCoordinate(coordinate: GeoCoordinate): LeafletLatLng {
  return {
    lat: coordinate.latitude,
    lng: coordinate.longitude,
    alt: coordinate.altitude
  };
}

function getZoom(): number {
  return map.getZoom();
}

function getCenter(): GeoCoordinate {
  const latLng = map.getCenter();
  return {
    latitude: latLng.lat,
    longitude: latLng.lng,
    altitude: latLng.alt
  };
}

function addLayers(map: LeafletMap): void {
  map.addLayer(createCoverageAreaPolygon());
  map.addLayer(createMarker());
}

function createMarker(): LeafletMarker {
  const L = (window as any)["L"];

  const icon = new L.Icon({ iconUrl: MapPointerIconUrl });
  marker = new L.Marker(
    map.getCenter(),
    {
      icon: icon,
      iconSize: new L.Point(25, 33),
      iconAnchor: new L.Point(12, 32),
      bubblingMouseEvents: false,
    },
  );
  map.on("move", () => {
    marker.setLatLng(map.getCenter());
  }).on("zoomstart", () => {
    marker.setOpacity(0);
  }).on("zoomend", () => {
    marker.setLatLng(map.getCenter());
    marker.setOpacity(1);
  }).on("click", () => {
    onMarkerClick();
  });

  return marker;
}

function createCoverageAreaPolygon(): LeafletPolygon {
  const L = (window as any)["L"];

  const COVERAGE_AREA_POINTS: LeafletLatLng[] = [
    { lat: 29.674149, lng: 52.496497 },
    { lat: 29.651285, lng: 52.515582 },
    { lat: 29.640626, lng: 52.542784 },
    { lat: 29.638509, lng: 52.542246 },
    { lat: 29.632064, lng: 52.538943 },
    { lat: 29.624138, lng: 52.532414 },
    { lat: 29.618344, lng: 52.527524 },
    { lat: 29.618344, lng: 52.527419 },
    { lat: 29.616046, lng: 52.496338 },
    { lat: 29.609855, lng: 52.494980 },
    { lat: 29.612095, lng: 52.484626 },
    { lat: 29.614722, lng: 52.477819 },
    { lat: 29.615819, lng: 52.468338 },
    { lat: 29.623388, lng: 52.471729 },
    { lat: 29.628898, lng: 52.475623 },
    { lat: 29.636605, lng: 52.466631 },
    { lat: 29.632190, lng: 52.456722 },
    { lat: 29.636424, lng: 52.454500 },
    { lat: 29.645511, lng: 52.455109 },
    { lat: 29.647841, lng: 52.453737 },
    { lat: 29.655284, lng: 52.451099 },
    { lat: 29.666701, lng: 52.449985 },
    { lat: 29.674979, lng: 52.449628 },
    { lat: 29.682868, lng: 52.443287 },
    { lat: 29.686876, lng: 52.443805 },
    { lat: 29.688389, lng: 52.446302 },
    { lat: 29.689856, lng: 52.453667 },
    { lat: 29.703540, lng: 52.457587 },
    { lat: 29.705197, lng: 52.462394 },
    { lat: 29.701513, lng: 52.465974 },
    { lat: 29.706237, lng: 52.472411 },
    { lat: 29.702991, lng: 52.484248 },
    { lat: 29.702851, lng: 52.484160 },
  ];

  coverageArea = new L.Polygon(
    COVERAGE_AREA_POINTS,
    {
      stroke: false,
      bubblingMouseEvents: false,
      fill: props.coverageRestrict,
    },
  );

  return coverageArea;
}

function setCenter(center?: GeoCoordinate): void {
  const currentCenter = getCenter();

  if (isAbsent(map) || isEqual(currentCenter, center)) return;

  map.setView(toLeafletCoordinate(center ?? DefaultCenter));
}

function setReadonlyMode(readonly: boolean): void {
  readonly ? map.dragging.disable() : map.dragging.enable();
  readonly ? map.touchZoom.disable() : map.touchZoom.enable();
  readonly ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable();
  readonly ? map.scrollWheelZoom.disable() : map.scrollWheelZoom.enable();
  readonly ? map.boxZoom.disable() : map.boxZoom.enable();
  readonly ? map.keyboard.disable() : map.keyboard.enable();
  readonly ? map.tap?.disable() : map.tap?.enable();
  readonly ? coverageArea?.setStyle({ fill: false }) : coverageArea?.setStyle({ fill: props.coverageRestrict });
}

function gotoCurrentPosition(): Promise<void> {
  return getCurrentPosition()
    .then((position) => map.setView(toLeafletCoordinate(position))).then(() => VOID)
    .catch((error: any) => {
      const appError = new ApplicationError("can't find current location", error);
      logger.error(appError.message, appError);
      return Promise.reject(appError);
    });
}

function onMarkerClick(): void {
  if (props.readonlyMode ?? false) return;

  selectCurrentLocation();
}

function searchLocation(): void {
  http.get(
    "https://api.neshan.org/v1/search",
    {
      "term": searchText.value,
      "lat": DefaultCenter.latitude,
      "lng": DefaultCenter.longitude
    },
    {
      "Api-Key": apiKey
    }
  ).subscribe((result) => {
    const location: GeoCoordinate = {
      latitude: result.items[0]?.location.y,
      longitude: result.items[0]?.location.x,
    };
    map.setView(toLeafletCoordinate(location));
  });
}

function getAddress(location: GeoLocation): Promise<SearchAddressResult> {
  return http.get(
    "https://api.neshan.org/v5/reverse",
    {
      "lat": `${location.latitude}`,
      "lng": `${location.longitude}`,
    },
    {
      "Api-Key": apiKey,
    }
  ).pipe(
    mergeMap(result => result.status?.toLowerCase() == "ok"
      ? of({ formatted: result.formatted_address })
      : throwError(() => new Error("invalid response"))
    ),
  ).asPromise();
}

function selectCurrentLocation(): void {
  const location = getCenter();
  const address = props.retrieveAddress ? getAddress(location) : Promise.resolve(undefined);
  let addressResult: Optional<SearchAddressResult> = undefined;
  address.then((result) => addressResult = result).finally(() => {
    const result: SelectedLocationInfo = {
      location: location,
      address: addressResult,
      coveredArea: props.coverageRestrict && isPresent(coverageArea)
        ? coverageArea?.contains(toLeafletCoordinate(location)) === true
        : undefined,
    };
    emit("locationSelect", result);
  });
}

onMounted(() => moduleInitialize.subscribe(initialize));

defineExpose<NeshanMapInstance>({
  selectCurrentLocation
});

interface LeafletLatLng {
  lat: number;
  lng: number;
  alt?: number;
}

interface LeafletLocateOptions {
  setView?: boolean;
}

interface LeafletHandler {
  disable(): void;
  enable(): void;
}

interface LeafletPathOptions {
  stroke?: boolean | undefined;
  color?: string | undefined;
  weight?: number | undefined;
  opacity?: number | undefined;
  fill?: boolean | undefined;
  fillColor?: string | undefined;
  fillOpacity?: number | undefined;
  className?: string | undefined;
}

interface LeafletPolylineOptions extends LeafletPathOptions {
  noClip?: boolean | undefined;
}

interface LeafletMap {
  readonly zoomControl: LeafletZoomControl;
  readonly dragging: LeafletHandler;
  readonly touchZoom: LeafletHandler;
  readonly doubleClickZoom: LeafletHandler;
  readonly scrollWheelZoom: LeafletHandler;
  readonly keyboard: LeafletHandler;
  readonly tap?: LeafletHandler;
  readonly boxZoom: LeafletHandler;
  getCenter(): LeafletLatLng;
  getZoom(): number;
  setZoom(zoom: number): number;
  setView(center: LeafletLatLng, zoom?: number): this;
  locate(options?: LeafletLocateOptions): this;
  on(
    event: "click"|"move"|"movestart"|"moveend"|"zoom"|"zoomstart"|"zoomend",
    handler: (event: Event) => void
  ): this;
  addLayer(layer: LeafletLayer): this;
}

interface LeafletLayer {
  remove(): this;
}

interface LeafletPath extends LeafletLayer {
  setStyle(options: LeafletPathOptions): this;
}

interface LeafletPolyline extends LeafletPath {
  getLatLngs(): LeafletLatLng[];
}

interface LeafletPolygon extends LeafletPolyline {
  new(latlngs: LeafletLatLng[], options?: LeafletPolylineOptions): this;
  contains(latlng: LeafletLatLng): boolean;
  on(event: "click", handler: (event: Event) => void): this;
}

interface LeafletMarker extends LeafletLayer {
  getLatLng(): LeafletLatLng;
  setLatLng(latlng: LeafletLatLng): this;
  setOpacity(opacity: number): this;
  on(event: "click", handler: (event: Event) => void): this;
}

interface LeafletZoomControl {
}

</script>

<style scoped lang="scss">
  .icon-map-location {
    display: block;
    margin: auto;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(./location-pos.svg);
    width: 20px;
    height: 20px;
  }
  .location-item {
    border: 2px solid rgba(0,0,0,.2);
    border-radius: 2px;
    left: 3px;
    top: 80px;
    z-index: 1000;
  }
  .map-container.read-only-map :deep(.leaflet-control-zoom) { display: none!important; }
  .map-container.read-only-map :deep(.leaflet-interactive) { cursor: default!important; }
</style>
