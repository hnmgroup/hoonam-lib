<template>
  <main>
    <div v-if="!page">
      <div><a class="page-link" @click.prevent="gotoDemoPage('date-time-picker')">Date Time Picker Demo</a></div>
      <div><a class="page-link" @click.prevent="gotoDemoPage('forms')">Forms Demo</a></div>
    </div>
    <div v-if="page">
      <DateTimePickerDemo v-if="page === 'date-time-picker'" />
      <FormsDemo v-if="page === 'forms'" />
      <hr>
      <div>
        <a class="page-link" @click.prevent="gotoDemoPage(null)">Home</a>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {Optional} from "@/utils/core-utils";
import DateTimePickerDemo from "@/demos/DateTimePickerDemo.vue";
import FormsDemo from "@/demos/FormsDemo.vue";

const page = ref<Optional<string>>(location.hash?.substring(1));

function gotoDemoPage(demo: string): void {
  page.value = demo;
  location.hash = demo ?? "";
}
</script>

<style scoped lang="scss">
main {
  text-align: center;
  line-height: 1.5;
  padding: 10px;
}
.page-link {
  cursor: pointer;
  color: royalblue;
  &:hover {
    text-decoration: underline;
  }
}
</style>
