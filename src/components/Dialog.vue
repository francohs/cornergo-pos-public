<template>
  <q-dialog v-bind="$attrs">
    <q-card class="q-pa-sm" :style="`width: ${width}px; max-width: 80vw`">
      <q-card-section class="row items-center q-pr-sm">
        <span class="text-h6">
          {{ title }}
        </span>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <Form @submit="$emit('confirm')">
          <slot />

          <div class="row justify-end q-mt-md" v-if="!noFooter">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              class="q-px-sm"
              label="Aceptar"
              :color="confirmColor"
              :loading="loading"
            />
          </div>
        </Form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
const props = defineProps({
  title: String,
  confirmColor: { type: String, default: 'positive' },
  loading: Boolean,
  noFooter: Boolean,
  width: { type: Number, default: 380 }
})
const emit = defineEmits(['confirm'])
</script>
