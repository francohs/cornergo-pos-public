<template>
  <q-inner-loading :showing="state">
    <q-spinner color="primary" size="60px" :thickness="2" />
  </q-inner-loading>
</template>

<script setup>
const props = defineProps({
  state: Boolean
})
</script>
