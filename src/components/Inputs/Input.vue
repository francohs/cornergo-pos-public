<template>
  <q-input
    outlined
    v-bind="$attrs"
    :type="password ? 'password' : 'text'"
    bottom-slots
    :label="label"
    :modelValue="formattedValue"
    :rules="rules"
    lazy-rules
    :input-class="limitClass"
    :style="`width: ${width ? width : 150}px;`"
    @focus="onFocus"
    @blur="isFocus = false"
    @keyup.enter="isFocus = false"
    @keypress="numberValidation"
    :loading="loading"
    ref="inputRef"
  >
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
    <q-tooltip v-if="tooltip">{{ tooltip }}</q-tooltip>
  </q-input>
</template>

<script setup>
import { computed, watch, ref, inject, nextTick } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps({
  storeId: String,
  id: String,
  field: String,
  modelValue: [String, Number],
  required: Boolean,
  email: Boolean,
  format: String,
  anotherRule: Function,
  password: Boolean,
  passwordConfirm: String,
  label: String,
  tooltip: String,
  max: Number,
  min: Number,
  onlynumbers: Boolean,
  high: Number,
  low: Number,
  bold: Boolean,
  width: [String, Number]
})

const rules = []
const isFocus = ref(false)
const inputRef = ref(null)
const store = props.storeId ? inject(props.storeId) : null
const loading = ref(false)

let prevModelValue = props.modelValue
watch(isFocus, async () => {
  if (props.storeId && !isFocus.value && prevModelValue != props.modelValue) {
    loading.value = true
    await store.update(props.id, { [props.field]: props.modelValue })
    loading.value = false
  } else {
    prevModelValue = props.modelValue
  }
})

const formattedValue = computed(() => {
  if (!isFocus.value && props.format) {
    return formatter[props.format](props.modelValue)
  }
  return props.modelValue
})

const limitClass = computed(() => {
  let classes = { 'text-bold': props.bold }
  const value = formatter.unformat(props.modelValue)
  if (props.modelValue) {
    classes = {
      ...classes,
      'text-bold': props.bold,
      'text-red': props.low !== undefined ? value < props.low : false,
      'text-orange':
        props.high !== undefined && props.low !== undefined
          ? value >= props.low && value < props.high
          : false,
      'text-green': props.high !== undefined ? value >= props.high : false
    }
  }
  return classes
})

const applyRules = () => {
  if (props.required) {
    rules.push(value => !!value || 'El campo es requerido')
  }
  if (props.email) {
    rules.push(
      value =>
        !!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.exec(value) ||
        !value ||
        'Debe ser un email valido'
    )
  }
  if (props.min !== undefined) {
    rules.push(value => {
      const min = props.min
      return (
        (value && value.length >= min) ||
        `Debe contener al menos ${min} caracteres`
      )
    })
  }
  if (props.max !== undefined) {
    rules.push(value => {
      const max = props.max
      return (
        (value && value.length <= max) ||
        `No debe contener mas de ${max} caracteres`
      )
    })
  }
  if (props.passwordConfirm !== undefined) {
    rules.push(value => {
      return (
        (value && value === props.passwordConfirm) ||
        'Las contraseñas deben coincidir'
      )
    })
  }
  if (props.format === 'rut') {
    rules.push(value => {
      return (
        (value && value.length >= 11 && value.length < 13) ||
        isFocus.value ||
        'Rut invalido'
      )
    })
  }
  if (props.anotherRule != undefined) {
    rules.push(props.anotherRule)
  }
}
applyRules()

const numberValidation = event => {
  if (
    props.onlynumbers ||
    ['currency', 'rut', 'percent'].includes(props.format)
  ) {
    if (!/\d/.exec(event.key)) event.preventDefault()
  }
}

const onFocus = async () => {
  isFocus.value = true
  await nextTick()
  inputRef.value.select()
}
</script>
