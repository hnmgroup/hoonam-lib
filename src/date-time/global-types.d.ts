import { formatDate } from "./date-formatter";

export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dt: typeof formatDate;
  }
}
