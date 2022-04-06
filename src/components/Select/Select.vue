<template>
  <q-select
    v-bind="$attrs"
    outlined
    :hint="hint"
    :rules="rules"
    :class="{ 'hide-select-input': $attrs.value != null }"
  >
    <template v-if="icon" v-slot:prepend>
      <q-icon :name="icon" />
    </template>
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </q-select>
</template>

<script setup>
const props = defineProps({
  required: Boolean,
  hint: String,
  icon: String
})

let rules = []
if (props.required) {
  rules.push(value => !!value || 'El campo es requerido')
}
</script>
