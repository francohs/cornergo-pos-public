<script setup>
const props = defineProps(['icon', 'label'])
</script>

<template>
  <q-item clickable v-close-popup v-bind="$attrs">
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>
