<script setup>
import { onMounted, inject, ref, nextTick } from 'vue'

const props = defineProps({
  storeId: String,
  field: String,
  icon: String,
  lazy: Boolean,
  descending: Boolean,
  fetchAll: Boolean,
  actives: Boolean,
  minInput: { type: Number, default: 0 }
})

const store = inject(props.storeId)
const options = ref([])
const fetchedOptions = ref([])
const selectRef = ref(null)

onMounted(async () => {
  if (!props.lazy && props.fetchAll) {
    await fetchOptions(props.field)
  }
})

const filterFn = async (value, update) => {
  if (fetchedOptions.value.length > 0 || !props.fetchAll) {
    if (value.length > props.minInput) {
      if (props.fetchAll) {
        options.value = fetchedOptions.value.filter(
          v => v.toUpperCase().indexOf(value.toUpperCase()) > -1
        )
      } else {
        await fetchOptions(props.field, value)
        options.value = fetchedOptions.value
      }
    } else {
      if (props.fetchAll) {
        options.value = fetchedOptions.value
      } else {
        options.value = []
      }
    }
    update()
  } else {
    if (props.lazy && props.fetchAll) await fetchOptions(props.field)
    options.value = fetchedOptions.value
    update()
  }
}

const fetchOptions = async (field, input) => {
  const query = {}
  if (input) {
    query.contains = {
      fields: [field],
      value: input
    }
  }
  if (props.actives) {
    query.equal = {
      active: true
    }
  }
  await store.getQueryOptions({
    query,
    select: [field],
    sort: {
      [field]: props.descending ? -1 : 1
    }
  })
  fetchedOptions.value = store.options.map(doc => doc[field])
}

defineExpose({
  focus: async () => {
    await nextTick()
    return selectRef.value.focus()
  }
})
</script>

<template>
  <Select
    v-bind="$attrs"
    outlined
    use-input
    input-debounce="0"
    clearable
    options-dense
    @filter="filterFn"
    :options="options"
    :loading="store.loading"
    fill-input
    hide-selected
    ref="selectRef"
  >
    <template v-if="icon" v-slot:prepend>
      <q-icon :name="icon" />
    </template>
  </Select>
</template>
