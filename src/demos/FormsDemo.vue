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
    <div class="inp-container" :class="{'invalid': form.fields.childCount.invalid}">
      <input type="number" v-form-field="form.fields.childCount" placeholder="child count" v-model="form.fields.childCount.value">
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.gender.invalid}">
      <select v-model="form.fields.gender.value" v-form-field="form.fields.gender">
        <option :value="undefined">&nbsp;</option>
        <option v-for="gender in GenderInfo.entries" :value="gender.value">
          {{gender.title}}
        </option>
      </select>
    </div>
    <div class="inp-container" :class="{'invalid': form.fields.birthDate.invalid}">
      <input type="date" placeholder="birth date"
             v-form-field="form.fields.birthDate"
             :value="formatDate(form.fields.birthDate.value, 'yyyy-MM-dd')"
             @input="e => form.fields.birthDate.value = e.target.value">
    </div>
    <div class="p5 m1" :class="{'invalid': form.fields.address.invalid}">
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
    <div class="p5 m1" :class="{'invalid': form.fields.marks.invalid}">
      <div><label>Marks</label></div>
      <div class="border mb1" v-for="mark in form.fields.marks.fields">
        <div class="inp-container d-iblock" :class="{'invalid': mark.fields.teach.invalid}">
          <input type="text" v-form-field="mark.fields.teach" placeholder="teach" v-model="mark.fields.teach.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': mark.fields.mark.invalid}">
          <input type="number" v-form-field="mark.fields.mark" placeholder="mark" v-model="mark.fields.mark.value">
        </div>
        <div class="inp-container d-iblock" :class="{'invalid': mark.fields.teacher.invalid}">
          <input type="text" v-form-field="mark.fields.teacher" placeholder="teacher" v-model="mark.fields.teacher.value">
        </div>
        <button @click.prevent="form.fields.marks.remove(mark.value)">-</button>
      </div>
      <div>
        <button @click.prevent="form.fields.marks.add()">+</button>
        <button class="ml2" @click.prevent="form.fields.marks.clear" v-show="form.fields.marks.size">-</button>
      </div>
    </div>
    <div class="p5 m1" :class="{'invalid': form.fields.friends.invalid}">
      <div><label>Friends</label></div>
      <div class="border mb1" v-for="friend in form.fields.friends.fields">
        <div class="inp-container d-iblock" :class="{'invalid': friend.invalid}">
          <input type="text" v-form-field="friend" placeholder="friend" v-model="friend.value">
        </div>
        <button @click.prevent="form.fields.friends.remove(friend.value)">-</button>
      </div>
      <div>
        <button @click.prevent="form.fields.friends.add()">+</button>
        <button class="ml2" @click.prevent="form.fields.friends.clear" v-show="form.fields.friends.size">-</button>
      </div>
    </div>
    <div class="p5 m1" :class="{'invalid': form.fields.colors.invalid}">
      <div><label>Colors</label></div>
      <div class="border mb1" v-for="color in form.fields.colors.fields">
        <div class="inp-container d-iblock" :class="{'invalid': color.invalid}">
          <select v-model="color.value" v-form-field="color">
            <option v-for="clr in ColorInfo.entries" :value="clr.value">
              {{clr.title}}
            </option>
          </select>
        </div>
        <button @click.prevent="form.fields.colors.remove(color.value)">-</button>
      </div>
      <div>
        <button @click.prevent="form.fields.colors.add()">+</button>
        <button class="ml2" @click.prevent="form.fields.colors.clear" v-show="form.fields.colors.size">-</button>
      </div>
    </div>
    <div class="p5 m1" :class="{'invalid': form.fields.roles.invalid}">
      <div><label>Roles</label></div>
      <div class="border mb1" v-for="role in form.fields.roles.fields">
        <div class="inp-container d-iblock" :class="{'invalid': role.invalid}">
          <select v-model="role.value" v-form-field="role">
            <option v-for="rol in RoleInfo.entries" :value="rol.value">
              {{rol.title}}
            </option>
          </select>
        </div>
        <button @click.prevent="form.fields.roles.remove(role.value)">-</button>
      </div>
      <div>
        <button @click.prevent="form.fields.roles.add()">+</button>
        <button class="ml2" @click.prevent="form.fields.roles.clear" v-show="form.fields.roles.size">-</button>
      </div>
    </div>
  </form>
  <hr>
  <div>
    {{JSON.stringify(form.getValue(), undefined, 2) ?? 'NULL'}}
  </div>
  <hr>
  <div>
    <ul class="err-list">
      <li v-for="err in form.dirtyErrors">{{err}}</li>
    </ul>
    <div class="valid bold" v-if="form.valid">VALID</div>
  </div>
  <hr>
  <button @click.prevent="validate">Validate</button>
</template>

<script setup lang="ts">
import {field, fieldGroup, fieldArray, vFormField, FormFieldGroup} from "@/forms";
import {
  integer, number, min, max,
  required, len, digitOnly, date,
  boolean, lessThan, maxLen, digits, isEnum
} from "@/validation";
import {toInteger, toNumber} from "@/utils/num-utils";
import {sanitizeDigits} from "@/utils/string-utils";
import {formatDate, today, toDate} from "@/utils/date-utils";
import {Optional, toBoolean, enumConv, enumInfo} from "@/utils/core-utils";
import {AbstractFormField} from "@/forms/abstract-form-field";
import {isInteger} from "lodash-es";

enum Gender {
  Male   = 1,
  Female = 2,
}
enum Color {
  Red = 1,
  Green = 2,
  Blue = 3,
}
enum Role {
  Admin = "admin",
  User = "user",
  Owner = "owner",
}

const GenderInfo = enumInfo(Gender);
const ColorInfo = enumInfo(Color);
const RoleInfo = enumInfo(Role);

const form = fieldGroup<RegisterForm>({
  name: field<string>({
    validator: [required()],
  }),
  nameReverse: field<string>({
    transform: [
      {
        transform: (_, self) => (self.root as FormFieldGroup<RegisterForm>).fields.name.getValue()?.toChars().reverse().join("")
      },
    ],
  }),
  code: field<string>({
    validator: [digitOnly(), len(1, 10)],
    transform: [sanitizeDigits],
  }),
  age: field<number>({
    validator: [integer(), min(1), max(100)],
    transform: [toInteger],
  }),
  avg: field<number>({
    validator: [number()],
    transform: [toNumber],
  }),
  isMarried: field<boolean>({
    validator: [boolean()],
    transform: [toBoolean],
  }),
  childCount: field<number>({
    validator: [
      {
        name: "childCountRequired",
        message: "invalid {1}",
        acceptEmpty: true,
        test(value: Optional<number>, ...args: any[]): Optional<boolean> {
          const form = (args.last() as AbstractFormField).root as FormFieldGroup<RegisterForm>;
          return !form.fields.isMarried.getValue() || isInteger(value);
        }
      },
      integer(),
      min(0),
      max(10),
    ],
    transform: [toInteger],
    disabled: (self) => !!!(self.root as FormFieldGroup<RegisterForm>).fields.isMarried.getValue()
  }),
  gender: field<number>({
    validator: [isEnum(Gender)],
    transform: [enumConv(Gender)],
  }),
  birthDate: field<Date>({
    validator: [date(), min(today().subtractYears(100)), lessThan(today())],
    transform: [toDate],
  }),
  postalCode: fieldGroup<PostalCode>({
    cityCode: field<number>({
      validator: [required(), integer(), digits(5)],
      transform: [toInteger],
    }),
    houseCode: field<number>({
      validator: [required(), integer(), digits(5)],
      transform: [toInteger],
    }),
  }, { validator: [required()] }),
  address: fieldGroup<Address>({
    city: field<string>({
      validator: [maxLen(30)],
    }),
    street: field<string>({
      validator: [required()],
    }),
  }),
  marks: fieldArray(fieldGroup<Mark>({
    teach: field<string>({
      validator: [required()],
    }),
    mark: field<number>({
      validator: [required(), number()],
      transform: [toNumber],
    }),
    teacher: field<string>(),
  }), {
    validator: [
      // minSize(1),
      // {
      //   name: "",
      //   message: "",
      //   test(value: Mark[], ...args): boolean | undefined {
      //     return false;
      //   }
      // },
    ],
  }),
  friends: fieldArray(field<string>({
    validator: [required()],
  }), {
    transform: [(fs) => fs.filter(n => n.length > 1)],
  }),
  colors: fieldArray<Color>(field<number>({
    validator: [required(), isEnum(Color)],
    transform: [enumConv(Color)],
  })),
  roles: fieldArray<Role>(field<any>({
    validator: [required(), isEnum(Role)],
    transform: [enumConv(Role)],
  })),
});

form.fields.gender.asEnum<Gender>().change.subscribe((newValue) => {
  console.log("Gender changed", Gender[newValue])
});

function validate(): void {
  console.log(form.fields.marks.getValue())
  form.validate(false, true);
}

interface RegisterForm {
  name: string;
  nameReverse: string;
  code?: string;
  age?: number;
  avg?: number;
  isMarried?: boolean;
  childCount?: number;
  gender?: Gender;
  birthDate?: Date;
  postalCode: PostalCode;
  address?: Address;
  marks: Mark[];
  friends: string[];
  colors?: Color[];
  roles?: Role[];
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
.ml2 { margin-left: 2px; }
.mb1 { margin-bottom: 1px; }
.m1 { margin: 1px; }
.d-iblock { display: inline-block; }
.d-block { display: block; }
.border { border: 1px solid black; }
.err-list {
  list-style-type: decimal;
  color: red;
}
</style>
