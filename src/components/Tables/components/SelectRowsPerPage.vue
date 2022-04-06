<template>
  <q-select
    v-bind="$attrs"
    dense
    borderless
    options-dense
    class="q-mr-sm"
    :options="[5, 10, 20, 30]"
  >
    <template v-slot:prepend>
      <q-icon name="reorder" />
    </template>
    <q-tooltip>Resultados por página</q-tooltip>
  </q-select>
</template>
