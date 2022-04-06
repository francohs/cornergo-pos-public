<template>
  <q-page class="row q-pa-lg">
    <div class="col" v-if="!loading"><slot /></div>

    <Loading :state="loading" />
  </q-page>
</template>

<script setup>
const props = defineProps({
  loading: Boolean
})
</script>
