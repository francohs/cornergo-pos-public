<template>
  <q-btn
    round
    icon="add"
    color="positive"
    class="q-ml-md"
    :to="{ name: `${store}/create` }"
  />
</template>

<script setup>
const props = defineProps(['store'])
</script>
