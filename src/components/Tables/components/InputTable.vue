<template>
  <q-input
    outlined
    v-bind="$attrs"
    :modelValue="modelValue"
    color="primary"
    @keypress="numberValidation"
  >
    <template v-slot:append>
      <q-icon name="search" />
      <q-icon
        name="cancel"
        v-if="modelValue.length > 0"
        @click="$emit('update:modelValue', '')"
        class="cursor-pointer"
        color="grey-7"
      />
    </template>
  </q-input>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  onlynumbers: Boolean
})

const numberValidation = event => {
  if (props.onlynumbers) {
    if (!/\d/.exec(event.key)) event.preventDefault()
  }
}
</script>
