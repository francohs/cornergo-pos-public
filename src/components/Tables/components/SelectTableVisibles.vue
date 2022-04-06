<template>
  <q-select
    multiple
    outlined
    options-dense
    style="min-width: 50px"
    v-bind="$attrs"
    display-value=""
    option-value="name"
    emit-value
    map-options
    :options="columns.filter(col => col.label != '')"
  >
    <template v-slot:prepend>
      <q-icon name="visibility" />
    </template>
    <q-tooltip anchor="top middle" self="bottom middle"
      >Columnas Visibles</q-tooltip
    >
  </q-select>
</template>

<script setup>
const props = defineProps(['columns'])
</script>
