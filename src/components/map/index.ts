import {loadScriptDynamically, loadStyleDynamically} from "@lib/utils/core-utils";
import {ReplaySubject} from "rxjs";

const _initialize = new ReplaySubject<void>();

export function setup(): void {
  const loadAssets = Promise.all([
    loadStyleDynamically("https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.7/index.css"),
    loadScriptDynamically("https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.7/index.js").then(() =>
      loadScriptDynamically("https://cdn.rawgit.com/hayeswise/Leaflet.PointInPolygon/v1.0.0/wise-leaflet-pip.js")),
  ]);

  loadAssets.then(() => _initialize.next());
}
export * from "./map-types";
export const initialize = _initialize;
