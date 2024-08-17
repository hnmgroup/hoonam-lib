<template>
  <form @submit.prevent v-form-field="form">
    <div class="inp-container" :class="{'invalid': form.fields.name.invalid}">
      <input type="text" name="name" placeholder="name" v-model="form.fields.name.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.code.invalid}">
      <input type="text" name="code" placeholder="code" v-model="form.fields.code.value">
    </div>
    <div :class="{'invalid': form.fields.postalCode.invalid}" class="p5">
      <div class="d-iblock border" v-for="postalCode in [form.fields.postalCode]">
        <label>Postal Code</label>
        <div class="inp-container d-iblock" :class="{'invalid': postalCode.fields.cityCode.invalid}">
          <input type="text" name="cityCode" placeholder="city code" v-model="postalCode.fields.cityCode.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': postalCode.fields.houseCode.invalid}">
          <input type="text" name="houseCode" placeholder="house code" v-model="postalCode.fields.houseCode.value">
        </div>
      </div>
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.age.invalid}">
      <input type="number" name="age" placeholder="age" v-model="form.fields.age.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.avg.invalid}">
      <input type="number" name="avg" placeholder="avg" v-model="form.fields.avg.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.isMarried.invalid}">
      <input type="checkbox" id="is-married" name="isMarried"
             placeholder="marriage" v-model="form.fields.isMarried.value">
      <label for="is-married">Is Married</label>
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.birthDate.invalid}">
      <input type="date" name="birthDate" placeholder="birth date"
             :value="formatDate(form.fields.birthDate.value, 'yyyy-MM-dd')"
             @input="e => form.fields.birthDate.value = e.target.value">
    </div>
    <div :class="{'invalid': form.fields.address.invalid}" class="p5">
      <div class="d-iblock border" v-for="address in [form.fields.address]">
        <label>Address</label>
        <div class="inp-container" :class="{'invalid': address.fields.city.invalid}">
          <input type="text" name="city" placeholder="city" v-model="address.fields.city.value">
        </div>
        <div class="inp-container" :class="{'invalid': address.fields.street.invalid}">
          <input type="text" name="street" placeholder="street" v-model="address.fields.street.value">
        </div>
      </div>
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
import {field, fieldGroup, fieldArray, vFormField} from "@/forms";
import {integer, number, min, max, required, len, digits, date, boolean, lessThan, maxLen} from "@/validation";
import {sanitizeInteger, sanitizeNumber} from "@/utils/num-utils";
import {sanitizeNumeric, sanitizeString} from "@/utils/string-utils";
import {sanitizeDate, formatDate, today} from "@/utils/date-utils";
import {sanitizeBoolean} from "@/utils/core-utils";

const form = fieldGroup<RegisterForm>({
  name: field<string>()
    .transform(sanitizeString)
    .validator(required()),
  postalCode: fieldGroup<RegisterForm["postalCode"]>({
    cityCode: field<number>()
      .transform(sanitizeInteger)
      .validator(required(), number(), min(10000), max(99999)),
    houseCode: field<number>()
      .transform(sanitizeInteger)
      .validator(required(), number(), min(10000), max(99999)),
  }).validator(required()),
  code: field<string>()
    .transform(sanitizeNumeric)
    .validator(digits(), len(1, 10)),
  age: field<number>()
    .transform(sanitizeInteger)
    .validator(integer(), min(1), max(100)),
  avg: field<number>()
    .transform(sanitizeNumber)
    .validator(number()),
  isMarried: field<boolean>()
    .transform(sanitizeBoolean)
    .validator(boolean()),
  birthDate: field<Date>()
    .transform(sanitizeDate)
    .validator(date(), min(today().subtractYears(100)), lessThan(today())),
  address: fieldGroup({
    city: field<string>()
      .transform(sanitizeString)
      .validator(maxLen(30)),
    street: field<string>()
      .transform(sanitizeString)
      .validator(required()),
  }),
  // friends: fieldArray({
  //   //
  // })
});

interface RegisterForm {
  name: string;
  postalCode: {
    cityCode: number;
    houseCode: number;
  };
  code?: string;
  age?: number;
  avg?: number;
  isMarried?: boolean;
  birthDate?: Date;
  address?: {
    city: string;
    street: string;
  };
  // friends: {
  //   name: string;
  //   age?: number;
  // }[];
}
</script>

<style scoped lang="scss">
.valid { color: green; }
.invalid { color: red; }
.bold { font-weight: bold; }
.inp-container {
  padding: 5px;
  margin: 1px;
}
.invalid {
  border: 1px solid red;
}
.p5 { padding: 5px; }
.d-iblock { display: inline-block; }
.d-block { display: block; }
.border { border: 1px solid black; }
</style>
