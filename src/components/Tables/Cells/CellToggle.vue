<template>
  <q-td :key="field" :props="cell">
    <q-toggle
      :modelValue="cell.row[field]"
      @update:modelValue="onToggle"
      color="green"
    />
  </q-td>
</template>

<script setup>
import { inject } from 'vue'

const props = defineProps(['storeId', 'field', 'cell'])

const store = inject(props.storeId)

const onToggle = async value => {
  let doc = { ...props.cell.row }
  doc[props.field] = value

  await store.update(doc._id, doc)
}
</script>
