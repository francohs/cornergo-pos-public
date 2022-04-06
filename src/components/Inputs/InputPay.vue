<template>
  <q-input
    outlined
    stack-label
    label="Monto de Pago"
    :modelValue="isFocus ? model : formatter.currency(model)"
    @update:modelValue="model = $event"
    @focus="onFocus"
    @blur="isFocus = false"
    @keypress="onlyNumbers"
    @keyup.enter="onEnter"
    input-style="font-size: 20px;"
    ref="inputPay"
  >
    <template v-if="icon" v-slot:prepend>
      <q-icon :name="icon" />
    </template>
  </q-input>
</template>

<script setup>
import { inject, ref, nextTick } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps(['icon'])
const emit = defineEmits(['totalReach'])

const isFocus = ref(false)
const model = ref('')
const pos = inject('pos')
const inputPay = ref(null)

const onEnter = () => {
  if (model.value == '') {
    model.value = pos.total
    emit('totalReach')
  } else if (parseInt(model.value) <= 20) {
    model.value = model.value + '000'
  }

  pos.addPay(parseInt(model.value))
  model.value = ''

  if (pos.isTotalReach) {
    emit('totalReach')
  } else {
    onFocus()
  }
}

const onFocus = async () => {
  isFocus.value = true
  await nextTick()
  inputPay.value.select()
}

const onlyNumbers = event => {
  var keyCode = event.keyCode ? event.keyCode : event.which
  if (keyCode < 47 || keyCode > 58) {
    event.preventDefault()
  }
}

defineExpose({ model })
</script>
