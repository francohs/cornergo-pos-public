<template>
  <q-page class="row justify-center q-pa-lg">
    <q-card
      v-if="!loading"
      class="col"
      :style="`min-width: ${minWidth}px; max-width: ${maxWidth}px`"
    >
      <q-card-section class="q-pa-none">
        <slot />
      </q-card-section>
    </q-card>

    <Loading :state="loading" />
  </q-page>
</template>

<script setup>
const props = defineProps({
  loading: Boolean,
  minWidth: { type: Number, default: 360 },
  maxWidth: { type: Number, default: 850 }
})
</script>
