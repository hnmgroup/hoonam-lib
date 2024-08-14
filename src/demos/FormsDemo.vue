<template>
  <form @submit.prevent v-form-field="form">
    <div class="inp-container" :class="{'invalid': form.fields.name.invalid}">
      <input type="text" name="name" placeholder="name" v-model="form.fields.name.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.code.invalid}">
      <input type="text" name="code" placeholder="code" v-model="form.fields.code.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.age.invalid}">
      <input type="number" name="age" placeholder="age" v-model="form.fields.age.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.avg.invalid}">
      <input type="number" name="avg" placeholder="avg" v-model="form.fields.avg.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.birthDate.invalid}">
      <input type="date" name="birthDate" placeholder="birth date" v-model="form.fields.birthDate.value">
    </div>
  </form>
  <hr>
  <div style="text-align: left;">
    {{JSON.stringify(form.value, undefined, 2) ?? 'NULL'}}
  </div>
  <hr>
  <div style="text-align: left;">
    <ul style="list-style-type: decimal; color: red;">
      <li v-for="err in form.errors">{{err}}</li>
    </ul>
    <div class="valid bold" v-if="form.valid">VALID</div>
  </div>
  <hr>
  <button @click.prevent="form.validate()">Validate</button>
</template>

<script setup lang="ts">
import {FormField, FormFieldGroup, vFormField} from "@/forms";
import {integer, number, min, max, required, len, digits, date} from "@/validation";
import {sanitizeInteger, sanitizeNumber} from "@/utils/num-utils";
import {sanitizeNumeric, sanitizeString} from "@/utils/string-utils";
import {sanitizeDate} from "@/utils/date-utils";

const form = new FormFieldGroup<RegisterForm>({
  name: new FormField<string>()
    .transform(sanitizeString)
    .validator(required()),
  code: new FormField<string>()
    .transform(sanitizeNumeric)
    .validator(digits(), len(1, 10)),
  age: new FormField<number>()
    .transform(sanitizeInteger)
    .validator(integer(), min(1), max(100)),
  avg: new FormField<number>()
    .transform(sanitizeNumber)
    .validator(number()),
  birthDate: new FormField<Date>()
    .transform(sanitizeDate) // TODO: check me
    .validator(date()),
});

interface RegisterForm {
  name: string;
  code?: string;
  age?: number;
  avg?: number;
  birthDate?: Date;
}
</script>

<style scoped lang="scss">
.valid { color: green; }
.invalid { color: red; }
.bold { font-weight: bold; }
.inp-container {
  padding: 5px;
  margin: 1px;
  &.invalid {
    border: 1px solid red;
  }
}
</style>
