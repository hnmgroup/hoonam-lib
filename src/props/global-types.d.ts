import {isAbsent, isPresent} from "@/utils/core-utils";
import {I18nService} from "@/i18n.service";

export {}
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $prod: boolean;
    $present: typeof isPresent;
    $absent: typeof isAbsent;
    $tl: InstanceType<typeof I18nService>["translateLabel"];
    $inpVal: <T extends string|boolean|number>(element: any) => T;
    $setVal: (element: any, value: any) => void;
    $elBlur: (element: any) => void;
  }
}
