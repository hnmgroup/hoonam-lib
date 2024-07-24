<template>
  <form @submit.prevent v-form-field="form">
    <input name="name" placeholder="name" v-model="form.fields.name.value">
  </form>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {FormField, FormFieldGroup, vFormField} from "@/forms";

const form = new FormFieldGroup<RegisterForm>({
  name: new FormField()
});

interface RegisterForm {
  name: string;
}
</script>
