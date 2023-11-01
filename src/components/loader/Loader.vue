<template>
  <div class="w-100 h-100 bg-white rounded" tabindex="-1"
       style="z-index: 5000;"
       :style="{
         'height': height ? height + '!important' : null,
         'cursor': state.is(OperationState.Processing) ? 'wait' : null
       }"
       :class="rootClasses"
       v-if="state.is(OperationState.Processing) || state.is(OperationState.Failed)">

      <div class="h-100 d-flex justify-content-center" style="align-items: center;">
        <slot name="loading-template" v-if="state.is(OperationState.Processing)">
          <div class="lds-default">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </slot>

        <slot name="failure-template">
          <div class="alert alert-danger" role="alert" style="cursor: initial;" v-if="state.is(OperationState.Failed)">
            متاسفانه مشکلی پیش آمده.
            &nbsp;
            <RouterLink :to="$route.fullPath" @click.prevent="retry()" class="alert-link">تلاش مجدد</RouterLink>
          </div>
        </slot>
      </div>
  </div>
  <slot></slot>
</template>

<script setup lang="ts">
import {OperationState, reloadPage} from "@/utils/core-utils";
import {computed} from "vue";

const props = withDefaults(defineProps<{
  state: OperationState,
  retry?: Function,
  height?: string,
  classes?: string[],
  coverContent?: boolean
}>(), {
  state: () => OperationState.Unknown,
  retry: reloadPage,
  coverContent: true
});
const rootClasses = computed<string[]>(() => {
  return ((props.coverContent ?? true) ? ['position-absolute'] : []).concat(props.classes ?? []);
});
</script>

<style scoped lang="scss">
.lds-default {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-default div {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--light-gray);
  border-radius: 50%;
  animation: lds-default 1.2s linear infinite;
}
.lds-default div:nth-child(1) {
  animation-delay: 0s;
  top: 37px;
  left: 66px;
}
.lds-default div:nth-child(2) {
  animation-delay: -0.1s;
  top: 22px;
  left: 62px;
}
.lds-default div:nth-child(3) {
  animation-delay: -0.2s;
  top: 11px;
  left: 52px;
}
.lds-default div:nth-child(4) {
  animation-delay: -0.3s;
  top: 7px;
  left: 37px;
}
.lds-default div:nth-child(5) {
  animation-delay: -0.4s;
  top: 11px;
  left: 22px;
}
.lds-default div:nth-child(6) {
  animation-delay: -0.5s;
  top: 22px;
  left: 11px;
}
.lds-default div:nth-child(7) {
  animation-delay: -0.6s;
  top: 37px;
  left: 7px;
}
.lds-default div:nth-child(8) {
  animation-delay: -0.7s;
  top: 52px;
  left: 11px;
}
.lds-default div:nth-child(9) {
  animation-delay: -0.8s;
  top: 62px;
  left: 22px;
}
.lds-default div:nth-child(10) {
  animation-delay: -0.9s;
  top: 66px;
  left: 37px;
}
.lds-default div:nth-child(11) {
  animation-delay: -1s;
  top: 62px;
  left: 52px;
}
.lds-default div:nth-child(12) {
  animation-delay: -1.1s;
  top: 52px;
  left: 62px;
}
@keyframes lds-default {
  0%, 20%, 80%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
}
</style>
