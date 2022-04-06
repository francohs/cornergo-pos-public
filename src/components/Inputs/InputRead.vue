<template>
  <q-input
    v-bind="$attrs"
    outlined
    readonly
    stack-label
    :modelValue="formattedValue"
    :input-class="`${bold ? 'text-bold' : ''}`"
    :style="`width: ${width ? width : 150}px;`"
    :hint="hint ? hint.toString() : ''"
  >
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </q-input>
</template>

<script setup>
import { computed } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps({
  modelValue: [String, Number],
  format: String,
  width: [String, Number],
  hint: [String, Number],
  bold: Boolean
})

const formattedValue = computed(() => {
  if (props.format) {
    return formatter[props.format](props.modelValue)
  }
  return props.modelValue
})
</script>
