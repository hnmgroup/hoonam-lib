<template>
  <div style="text-align: center; line-height: 1.5; padding: 10px;">
    <div v-if="!page">
      <div><a class="page-link" @click.prevent="page = 'date-time-picker'">Date Time Picker Demo</a></div>
      <div><a class="page-link" @click.prevent="page = 'forms'">Forms Demo</a></div>
    </div>
    <div v-if="page">
      <DateTimePickerDemo v-if="page === 'date-time-picker'" />
      <FormsDemo v-if="page === 'forms'" />
      <hr>
      <div>
        <a class="page-link" @click.prevent="page = null">Home</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {Optional} from "@/utils/core-utils";
import DateTimePickerDemo from "@/demo/DateTimePickerDemo.vue";
import FormsDemo from "@/demo/FormsDemo.vue";

const page = ref<Optional<string>>();
</script>

<style scoped lang="scss">
.page-link {
  cursor: pointer;
  color: royalblue;
  &:hover {
    text-decoration: underline;
  }
}
</style>
