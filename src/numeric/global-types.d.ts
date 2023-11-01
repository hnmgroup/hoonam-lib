import { formatNumber } from "./number-formatter";

export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $nf: typeof formatNumber;
  }
}
