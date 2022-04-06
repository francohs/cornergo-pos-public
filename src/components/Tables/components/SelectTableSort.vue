<template>
  <q-select
    outlined
    options-dense
    style="min-width: 50px"
    display-value=""
    :modelValue="selected"
    :options="options"
  >
    <template v-slot:prepend>
      <q-icon name="sort" />
    </template>

    <template v-slot:option="scope">
      <q-item clickable dense @click="onSelect(scope)">
        <q-item-section :class="{ 'text-primary': scope.selected }">
          <q-item-label v-html="scope.opt"></q-item-label>
        </q-item-section>

        <q-item-section v-show="scope.selected" side class="text-primary">
          <q-icon v-if="modelValue.descending" name="arrow_downward" />
          <q-icon v-else name="arrow_upward" />
        </q-item-section>
      </q-item>
    </template>

    <q-tooltip anchor="top middle" self="bottom middle">Orden</q-tooltip>
  </q-select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue', 'columns', 'visibles'])
const emit = defineEmits(['update:modelValue'])

const selected = computed(() => {
  const selectedColumn = props.columns.find(
    col => col.name === props.modelValue.sortBy
  )
  return selectedColumn ? selectedColumn.label : null
})

const options = computed(() => {
  return props.columns
    .filter(col => props.visibles.includes(col.name))
    .filter(col => !['_id'].includes(col.name))
    .map(col => col.label)
})

function onSelect(scope) {
  const selectedColumn = props.columns.find(col => col.label == scope.opt)

  const newSort = {
    ...props.modelValue,
    sortBy: selectedColumn ? selectedColumn.name : null,
    descending: false
  }

  if (newSort.sortBy === props.modelValue.sortBy) {
    if (!props.modelValue.descending) {
      newSort.descending = true
    } else {
      newSort.sortBy = null
    }
  }

  emit('update:modelValue', { ...props.modelValue, ...newSort })
}
</script>
