<template>
  <Select
    v-bind="$attrs"
    :option-label="field"
    :option-value="emittedField"
    emit-value
    map-options
    @filter="filterFn"
    :options="options"
    :loading="store.loading"
  />
</template>

<script setup>
import { onMounted, inject, ref } from 'vue'

const props = defineProps({
  storeId: String,
  field: String,
  emittedField: String,
  lazy: Boolean,
  descending: Boolean
})

const store = inject(props.storeId)
const options = ref([])

onMounted(async () => {
  if (!props.lazy) {
    await fetchOptions()
  }
})

const fetchOptions = async () => {
  await store.getQueryDocs({
    query: {},
    select: props.emittedField
      ? [props.emittedField, props.field]
      : [props.field],
    sort: {
      [props.field]: props.descending ? -1 : 1
    }
  })
  options.value = store.docs
}

const filterFn = async (value, update) => {
  if (options.value.length === 0) {
    if (props.lazy) await fetchOptions()
    update()
  }
}
</script>
