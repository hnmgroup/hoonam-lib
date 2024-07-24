<template>
  <svg ref="container"></svg>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import JsBarcode from "jsbarcode";
import {isEmpty} from "@/utils/string-utils";
import {isAbsent, omitEmpty} from "@/utils/core-utils";

const props = defineProps<{
  value: string;
  height?: number;
}>();

watch(() => props.value, renderBarcode);
watch(() => props.height, renderBarcode);

const container = ref<HTMLElement>();

function renderBarcode(): void {
  if (isAbsent(container.value)) return;
  if (isEmpty(props.value)) return;

  JsBarcode(container.value, props.value, omitEmpty({
    height: props.height,
  }));
}

onMounted(renderBarcode);
</script>
