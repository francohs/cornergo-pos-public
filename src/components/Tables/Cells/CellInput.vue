<template>
  <q-td :key="field" :props="cell">
    <q-input
      v-if="editMode"
      v-model="inputValue"
      ref="inputRef"
      class="full-width"
      dense
      outlined
      autofocus
      :loading="store.saving"
      @keyup.enter="editOut"
      @keyup.esc="editOut"
      @blur="editOut"
      :input-class="`text-${align}`"
    />

    <div v-else @dblclick="editIn">
      <div v-if="formatedValue" style="height: 40px; line-height: 40px">
        {{ textOverflow(formatedValue) }}
        <q-tooltip v-if="formatedValue.length > maxLength">
          {{ formatedValue }}
        </q-tooltip>
      </div>
      <div v-else style="width: 50px; height: 40px"></div>
    </div>
  </q-td>
</template>

<script setup>
import formatter from 'tools/formatter'
import { inject, computed, ref, nextTick } from 'vue'

const props = defineProps(['storeId', 'field', 'cell', 'format'])
const emit = defineEmits(['editOutChange'])

const store = inject(props.storeId)

const editMode = ref(false)
const textValue = ref(props.cell.row[props.field])
const inputValue = ref(props.cell.row[props.field])
const inputRef = ref({})
const align = props.cell.colsMap[props.field]
  ? ref(props.cell.colsMap[props.field].align)
  : ref('left')
const maxLength = ref(35)

const formatedValue = computed(() => {
  if (props.format) {
    return formatter[props.format](props.cell.row[props.field])
  }
  return props.cell.row[props.field]
})

const textOverflow = value => {
  return value.length > maxLength.value
    ? value.slice(0, maxLength.value) + '...'
    : value
}

const editIn = async () => {
  editMode.value = true

  await nextTick()

  textValue.value = props.cell.row[props.field]
  inputValue.value = props.cell.row[props.field]
  inputRef.value.select()
}

const editOut = async event => {
  if (textValue.value !== inputValue.value) {
    if (event.key == 'Escape') {
      textValue.value = props.cell.row[props.field]
    } else {
      let doc = { ...props.cell.row }
      textValue.value = inputValue.value

      await store.update(doc._id, {
        [props.field]: inputValue.value
      })

      emit('editOutChange')
    }
  }
  editMode.value = false
}
</script>
