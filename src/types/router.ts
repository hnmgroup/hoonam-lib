import {ComponentPublicInstance} from "vue";
import {RouteLocationRaw} from "vue-router";

export declare type NavigationGuardNextCallback = (vm: ComponentPublicInstance) => any;
export declare type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean | NavigationGuardNextCallback;
