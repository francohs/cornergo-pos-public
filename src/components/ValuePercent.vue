<template>
  <div :class="limitClass">{{ percent }}%</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  total: { type: Number, required: true },
  high: Number,
  low: Number,
  bold: Boolean
})

const percent = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.value / props.total - 1) * 100)
})

const limitClass = computed(() => ({
  'text-bold': props.bold,
  'text-red': props.low ? percent.value < props.low : false,
  'text-orange':
    props.high && props.low
      ? percent.value >= props.low && percent.value < props.high
      : false,
  'text-green': props.high ? percent.value >= props.high : false
}))
</script>
