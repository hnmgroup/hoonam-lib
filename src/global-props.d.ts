import "vite/client";

export {}
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $prod: boolean;
    $present: (value: any) => boolean;
    $absent: (value: any) => boolean;
    $inpVal: <T extends string | boolean | number>(element: any) => T;
    $setVal: (element: any, value: any) => void;
    $elBlur: (element: any) => void;
  }
}
