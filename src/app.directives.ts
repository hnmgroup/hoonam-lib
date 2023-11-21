import {App} from "vue";
import {registerSharedDirectives} from "@/directives";

export function registerAppDirectives(app: App): void {
  registerSharedDirectives(app);
}
