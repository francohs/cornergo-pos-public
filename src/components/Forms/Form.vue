<template>
  <q-form v-bind="$attrs" @validation-error="onValidationError">
    <slot />
  </q-form>
</template>

<script setup>
import { useQuasar } from 'quasar'

const quasar = useQuasar()

const onValidationError = () => {
  quasar.notify({ type: 'negative', message: 'Tienes campos invalidos' })
}
</script>
