<template>
  <div class="position-relative">
    <div ref="mapElement" class="map-container w-100"
         :class="{'hide-zoom-control': readonlyMode}"
         :style="{'height': mapHeight}">
    </div>

    <span class="map-pointer-container position-absolute start-50 top-50 text-main" @click="onPointerClick" style="z-index: 1000;">
      <i class="icon-map-pointer"></i>
    </span>

    <a class="position-absolute text-main me-2 bg-white p-1 location-item"
       @click.prevent="gotoCurrentPosition"
       v-show="!readonlyMode">
      <i class="icon-map-location"></i>
    </a>

    <form class="input-group position-absolute text-main top-0 right-0 m-1 w-75"
         style="z-index: 1000;" v-show="!readonlyMode"
         @submit.prevent="searchLocation">
      <input type="text" class="form-control form-control-sm shadow-none"
             inputmode="search" placeholder="جستجو آدرس..." v-model="searchText">
      <button type="submit" class="input-group-text bg-white border-start-0 cursor-pointer">
        <i class="bi bi-search icon-size-1x"></i>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import {GeoCoordinate, NeshanMapInstance} from "./map-types";
import {onMounted, ref, watch} from "vue";
import {resolve} from "@/provider.service";
import {Configuration} from "@/configuration";
import {LoggerService} from "@/logger.service";
import {isEqual} from "lodash-es";
import {ApplicationError, isAbsent, Optional, getCurrentPosition, VOID, DEFAULT_POSITION} from "@/utils/core-utils";
import axios from "axios";

const logger = resolve<LoggerService>(LoggerService);
const config = resolve<Configuration>(Configuration);
const webKey = config.getValue<string>("neshanMap.webKey");
const apiKey = config.getValue<string>("neshanMap.apiKey");
const DefaultCenter: GeoCoordinate = DEFAULT_POSITION;
const DefaultZoom = 14;
const searchText = ref<Optional<string>>();

const props = withDefaults(defineProps<{
  modelValue?: GeoCoordinate,
  center?: GeoCoordinate,
  zoom?: number
  mapHeight?: string;
  readonlyMode?: boolean;
}>(), {
  mapHeight: "450px"
});

watch(
  () => props.readonlyMode,
  (readonly) => setReadonlyMode(readonly)
);
watch(
  () => props.modelValue,
  (location) => setCenter(location)
);
watch(
  () => props.center,
  (location) => setCenter(location)
);

const emit = defineEmits<{
  (e: "update:modelValue", location: GeoCoordinate): void,
  (e: "update:zoom", zoom: number): void,
  (e: "pointerClick"): void,
  (e: "locationSelect", address?: SearchAddressResult): void
}>();

const mapElement = ref<HTMLElement>();
let leafletMap: LeafletMap;
let zoomControl: LeafletZoomControl;

function initialize(): void {
  const L = (window as any)["L"];

  leafletMap = new L.Map(mapElement.value, {
    key: webKey,
    maptype: "dreamy",
    poi: true,
    traffic: false,
    center: toLeafletCoordinate(props.modelValue ?? props.center ?? DefaultCenter),
    zoom: props.zoom ?? DefaultZoom
  });
  zoomControl = leafletMap.zoomControl;
  leafletMap.on("moveend", () => emit("update:modelValue", getCenter()));
  leafletMap.on("zoomend", () => emit("update:zoom", getZoom()));
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
  return leafletMap.getZoom();
}

function getCenter(): GeoCoordinate {
  const latLng = leafletMap.getCenter();
  return {
    latitude: latLng.lat,
    longitude: latLng.lng,
    altitude: latLng.alt
  };
}

function setCenter(center?: GeoCoordinate): void {
  const currentCenter = getCenter();

  if (isAbsent(leafletMap) || isEqual(currentCenter, center)) return;

  leafletMap.setView(toLeafletCoordinate(center ?? DefaultCenter));
}

function setReadonlyMode(readonly: boolean): void {
  readonly ? leafletMap.dragging.disable() : leafletMap.dragging.enable();
  readonly ? leafletMap.touchZoom.disable() : leafletMap.touchZoom.enable();
  readonly ? leafletMap.doubleClickZoom.disable() : leafletMap.doubleClickZoom.enable();
  readonly ? leafletMap.scrollWheelZoom.disable() : leafletMap.scrollWheelZoom.enable();
  readonly ? leafletMap.boxZoom.disable() : leafletMap.boxZoom.enable();
  readonly ? leafletMap.keyboard.disable() : leafletMap.keyboard.enable();
  readonly ? leafletMap.tap?.disable() : leafletMap.tap?.enable();
}

function gotoCurrentPosition(): Promise<void> {
  return getCurrentPosition()
    .then((position) => leafletMap.setView(toLeafletCoordinate(position))).then(() => VOID)
    .catch((error: any) => {
      const appError = new ApplicationError("can't find current location", error);
      logger.error(appError.message, appError);
      return Promise.reject(appError);
    });
}

function onPointerClick(): void {
  if (props.readonlyMode ?? false) return;

  emit("pointerClick");
}

function searchLocation(): void {
  axios.get(
    "https://api.neshan.org/v1/search",
    {
      params: {
        "term": searchText.value,
        "lat": DefaultCenter.latitude,
        "lng": DefaultCenter.longitude
      },
      headers: {
        "Api-Key": apiKey
      }
    }).then((response) => {
      const location: GeoCoordinate = {
        latitude: response.data.items[0]?.location.y,
        longitude: response.data.items[0]?.location.x
      };
      leafletMap.setView(toLeafletCoordinate(location));
  });
}

function getCurrentPointerAddress(): Promise<SearchAddressResult> {
  const location = getCenter();
  return new Promise((resolve, reject) => {
    axios.get(
      "https://api.neshan.org/v5/reverse",
      {
        params: {
          "lat": `${location.latitude}`,
          "lng": `${location.longitude}`,
        },
        headers: {
          "Api-Key": apiKey
        }
      }
    ).then((response) => {
      if (response.data.status != "OK") {
        reject(response.data);
        return;
      }

      resolve({
        formatted: response.data.formatted_address
      });

    }, reject);
  });
}

onMounted(initialize);

defineExpose<NeshanMapInstance>({
  getCenter: getCenter,
  selectCurrentLocation: () => getCurrentPointerAddress().then((address) => emit('locationSelect', address))
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
  on(event: LeafletEvent, handler: (...args: any[]) => void): this;
}

interface LeafletZoomControl {
}

interface SearchAddressResult {
  formatted: string;
}

type LeafletEvent = "moveend"|"zoomend";

</script>

<style scoped lang="scss">
  .icon-map-pointer {
    display: block;
    margin: -16.5px auto auto auto;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(./map-pointer.svg);
    width: 25px;
    height: 33px;
  }
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
  .map-container.hide-zoom-control :deep(.leaflet-control-zoom) { display: none!important; }
</style>
