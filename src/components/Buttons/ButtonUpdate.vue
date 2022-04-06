<template>
  <q-btn v-bind="$attrs" label="GUARDAR" color="positive" @click="onClick" />
</template>

<script setup>
import { inject } from 'vue'

const props = defineProps(['storeId', 'id', 'doc'])
const store = inject(props.storeId)

const onClick = async () => {
  if (props.id) {
    await store.update(props.id, props.doc)
  } else {
    await store.create(props.doc)
  }
}
</script>
