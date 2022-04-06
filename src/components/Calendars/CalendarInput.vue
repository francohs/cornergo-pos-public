<template>
  <q-input
    v-bind="$attrs"
    outlined
    clearable
    style="width: 185px"
    class="q-pa-none readonly"
    ref="inputDatePicker"
    :modelValue="formatter.date(model.split('/').join('-'))"
    @click="calendarPopup.show()"
    @clear="clearDatePicker"
  >
    <template v-slot:prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="calendarPopup">
          <q-date
            flat
            bordered
            square
            minimal
            :locale="locale"
            :modelValue="model"
            @update:modelValue="hideDatePicker"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { ref } from 'vue'
import { locale } from 'tools/locale'
import formatter from 'tools/formatter'

const emit = defineEmits(['update:modelValue'])

const calendarPopup = ref(null)
const inputDatePicker = ref(null)
const model = ref('')
emit('update:modelValue', null)

const hideDatePicker = value => {
  calendarPopup.value.hide()
  inputDatePicker.value.blur()
  model.value = value
  emit('update:modelValue', value.split('/').join('-'))
}

const clearDatePicker = () => {
  model.value = ''
  inputDatePicker.value.blur()
}
</script>
