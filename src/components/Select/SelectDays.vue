<template>
  <q-select
    v-bind="$attrs"
    :options="options"
    multiple
    use-chips
    outlined
    class="col"
  />
</template>

<script setup>
const options = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo'
]
</script>
