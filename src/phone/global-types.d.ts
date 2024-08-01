import { formatPhoneNumber } from "./phone-number-utils";

export {}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $phone: typeof formatPhoneNumber;
  }
}
