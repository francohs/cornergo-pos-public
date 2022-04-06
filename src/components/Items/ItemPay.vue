<template>
  <q-item class="q-pl-none q-pr-sm">
    <q-item-section side>
      <q-btn dense flat icon="clear" color="grey-7" @click="remove" />
    </q-item-section>
    <q-item-section>
      {{ pay.payType }}
    </q-item-section>
    <q-item-section side>
      {{ formatter.currency(pay.payAmount) }}
    </q-item-section>
  </q-item>
</template>

<script setup>
import { inject } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps(['pay'])
const emit = defineEmits(['remove'])

const pos = inject('pos')

const remove = () => {
  pos.removePay(props.pay)
  emit('remove')
}
</script>
