import {App} from "vue";
import {registerCommonGlobalProps} from "@/props/props";
import {registerNumericGlobalProps} from "@/numeric/number-formatter";
import {registerDateGlobalProps} from "@/date-time";
import {registerPhoneGlobalProps} from "@/phone/phone-number-utils";

export function registerAppGlobalProps(app: App): void {
  registerCommonGlobalProps(app);
  registerNumericGlobalProps(app);
  registerDateGlobalProps(app);
  registerPhoneGlobalProps(app);
}
