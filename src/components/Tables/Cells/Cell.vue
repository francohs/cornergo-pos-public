<template>
  <q-td :key="field" :props="cell">
    <slot>
      {{ formatedValue }}
    </slot>
  </q-td>
</template>

<script setup>
import { computed } from 'vue'
import formatter from 'tools/formatter'
import helper from 'tools/helper'

const props = defineProps(['field', 'format', 'cell'])

const value = helper.isNested(props.cell.row, props.field)

const formatedValue = computed(() => {
  if (props.format) {
    return formatter[props.format](value)
  }
  return value
})
</script>
