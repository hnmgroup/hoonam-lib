<template>
  <form @submit.prevent v-form-field="form">
    <div class="inp-container" :class="{'invalid': form.fields.name.invalid}">
      <input type="text" v-form-field="form.fields.name" placeholder="name" v-model="form.fields.name.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.code.invalid}">
      <input type="text" v-form-field="form.fields.code" placeholder="code" v-model="form.fields.code.value">
    </div>
    <div :class="{'invalid': form.fields.postalCode.invalid}" class="p5">
      <div class="d-iblock border" v-for="postalCode in [form.fields.postalCode]">
        <label>Postal Code</label>
        <div class="inp-container d-iblock" :class="{'invalid': postalCode.fields.cityCode.invalid}">
          <input type="text" v-form-field="postalCode.fields.cityCode" placeholder="city code" v-model="postalCode.fields.cityCode.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': postalCode.fields.houseCode.invalid}">
          <input type="text" v-form-field="postalCode.fields.houseCode" placeholder="house code" v-model="postalCode.fields.houseCode.value">
        </div>
      </div>
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.age.invalid}">
      <input type="number" v-form-field="form.fields.age" placeholder="age" v-model="form.fields.age.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.avg.invalid}">
      <input type="number" v-form-field="form.fields.avg" placeholder="avg" v-model="form.fields.avg.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.isMarried.invalid}">
      <input type="checkbox" id="is-married"
             v-form-field="form.fields.isMarried"
             placeholder="marriage"
             v-model="form.fields.isMarried.value">
      <label for="is-married">Is Married</label>
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.birthDate.invalid}">
      <input type="date" placeholder="birth date"
             v-form-field="form.fields.birthDate"
             :value="formatDate(form.fields.birthDate.value, 'yyyy-MM-dd')"
             @input="e => form.fields.birthDate.value = e.target.value">
    </div>
    <div :class="{'invalid': form.fields.address.invalid}" class="p5">
      <div class="d-iblock border" v-for="address in [form.fields.address]">
        <label>Address</label>
        <div class="inp-container d-iblock" :class="{'invalid': address.fields.city.invalid}">
          <input type="text" v-form-field="address.fields.city" placeholder="city" v-model="address.fields.city.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': address.fields.street.invalid}">
          <input type="text" v-form-field="address.fields.street" placeholder="street" v-model="address.fields.street.value">
        </div>
      </div>
    </div>
    <div :class="{'invalid': form.fields.marks.invalid}" class="p5">
      <div><label>Marks</label></div>
      <div class="d-iblock border" v-for="mark in form.fields.marks.fields">
        <div class="inp-container d-iblock" :class="{'invalid': mark.fields.teach.invalid}">
          <input type="text" v-form-field="mark.fields.teach" placeholder="teach" v-model="mark.fields.teach.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': mark.fields.mark.invalid}">
          <input type="number" v-form-field="mark.fields.mark" placeholder="house code" v-model="mark.fields.mark.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': mark.fields.teacher.invalid}">
          <input type="text" v-form-field="mark.fields.teacher" placeholder="teacher" v-model="mark.fields.teacher.value">
        </div>
      </div>
      <button @click.prevent="form.fields.marks.add">+</button>
    </div>
  </form>
  <hr>
  <div>
    {{JSON.stringify(form.value, undefined, 2) ?? 'NULL'}}
  </div>
  <hr>
  <div>
    <ul class="err-list">
      <li v-for="err in form.errors">{{err}}</li>
    </ul>
    <div class="valid bold" v-if="form.valid">VALID</div>
  </div>
  <hr>
  <button @click.prevent="form.validate(false, true)">Validate</button>
</template>

<script setup lang="ts">
import {field, fieldGroup, fieldArray, vFormField} from "@/forms";
import {integer, number, min, max, required, len, digits, date, boolean, lessThan, maxLen} from "@/validation";
import {sanitizeInteger, sanitizeNumber} from "@/utils/num-utils";
import {sanitizeNumeric, sanitizeString} from "@/utils/string-utils";
import {sanitizeDate, formatDate, today} from "@/utils/date-utils";
import {sanitizeBoolean} from "@/utils/core-utils";
import {onBeforeMount} from "vue";

const form = fieldGroup<RegisterForm>({
  name: field<string>()
    .transform(sanitizeString)
    .validator(required()),
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
  postalCode: fieldGroup<PostalCode>({
    cityCode: field<number>()
      .transform(sanitizeInteger)
      .validator(required(), number(), min(10000), max(99999)),
    houseCode: field<number>()
      .transform(sanitizeInteger)
      .validator(required(), number(), min(10000), max(99999)),
  }).validator(required()),
  address: fieldGroup<Address>({
    city: field<string>()
      .transform(sanitizeString)
      .validator(maxLen(30)),
    street: field<string>()
      .transform(sanitizeString)
      .validator(required()),
  }),
  marks: fieldArray<Mark>(() => ({
    teach: field<string>().transform(sanitizeString).validator(required()),
    mark: field<number>().transform(sanitizeNumber).validator(required(), number()),
    teacher: field<string>().transform(sanitizeString),
  })),
});

onBeforeMount(() => {
  // form.fields.marks.add({
  //   teach: "C#",
  //   mark: 18,
  //   teacher: "Bob",
  // });
});

interface RegisterForm {
  name: string;
  code?: string;
  age?: number;
  avg?: number;
  isMarried?: boolean;
  birthDate?: Date;
  postalCode: PostalCode;
  address?: Address;
  marks: Mark[];
}
interface PostalCode {
  cityCode: number;
  houseCode: number;
}
interface Address {
  city?: string;
  street: string;
}
interface Mark {
  teach: string;
  mark: number;
  teacher?: string;
}
</script>

<style scoped lang="scss">
.valid { color: green; }
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
.err-list {
  list-style-type: decimal;
  color: red;
}
</style>
