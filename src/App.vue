<template>
  <div style="width: 300px; margin: 0 auto;">
    <date-time-picker
      v-model="date"
      :auto-submit="false"
      :clearable="clearable"
      :icon-button="iconButton"
      :editable="false"
    ></date-time-picker>

    <div>
      <input type="checkbox" v-model="clearable" id="clearable">
      <label for="clearable">Clearable</label>
    </div>

    <div>
      <input type="checkbox" v-model="iconButton" id="icon-button">
      <label for="icon-button">Icon Button</label>
    </div>

    <div>
      <input type="checkbox" :checked="rtl" id="rtl"
             @change="changeDir">
      <label for="rtl">RTL</label>
    </div>

    <hr/>
    <div>
      {{date?.toString() ?? 'NULL'}}
    </div>
  </div>
</template>

<script setup lang="ts">
import {DateTimePicker} from "@/components/date-time-picker";
import {computed, ref} from "vue";

const rtl = computed(() => document.documentElement.dir == 'rtl');
const iconButton = ref(true);
const clearable = ref(true);
const date = ref(new Date());

function changeDir(): void {
  document.documentElement.dir = document.documentElement.dir == 'rtl' ? 'ltr' : 'rtl'
}
</script>
