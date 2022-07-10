<script setup>
import { ref } from 'vue'

const props = defineProps({
  required: Boolean,
  hint: String,
  icon: String
})

const qselectRef = ref(null)

let rules = []
if (props.required) {
  rules.push(value => !!value || 'El campo es requerido')
}

defineExpose({
  focus: () => {
    qselectRef.value.$el.focus()
  }
})
</script>

<template>
  <q-select
    v-bind="$attrs"
    outlined
    :hint="hint"
    :rules="rules"
    :class="{ 'hide-select-input': $attrs.value != null }"
    ref="qselectRef"
  >
    <template v-if="icon" v-slot:prepend>
      <q-icon :name="icon" />
    </template>
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </q-select>
</template>
