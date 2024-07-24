<template>
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
</template>

<script setup>
import {ref} from "vue";
import DateTimePickerDemo from "@/demos/DateTimePickerDemo.vue";
import FormsDemo from "@/demos/FormsDemo.vue";

const page = ref();
</script>

<style scoped lang="scss">
.page-link {
  cursor: pointer;
  color: blue;
}
</style>
