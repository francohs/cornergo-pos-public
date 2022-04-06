<template>
  <q-item
    class="q-pl-none q-pr-sm"
    :class="{
      'text-bold q-my-sm':
        cashMove.moveType == 'Inicio de Caja' ||
        cashMove.moveType == 'Cierre de Caja'
    }"
  >
    <q-item-section side>
      <q-icon
        v-if="cashMove.moveType == 'Pago a Proveedor'"
        name="local_shipping"
      />
      <q-icon
        v-else-if="cashMove.moveType == 'Otro Ingreso'"
        name="arrow_forward"
      />
      <q-icon
        v-else-if="cashMove.moveType == 'Otro Egreso'"
        name="arrow_back"
      />
      <q-icon
        v-else-if="cashMove.moveType == 'Inicio de Caja'"
        name="check_circle_outline"
        color="positive"
      />
      <q-icon
        v-else-if="cashMove.moveType == 'Cierre de Caja'"
        name="check_circle_outline"
        color="negative"
      />
    </q-item-section>
    <q-item-section side>
      {{ formatter.time(cashMove.createdAt) }}
    </q-item-section>
    <q-item-section>
      {{ cashMove.description }}
    </q-item-section>
    <q-item-section side>
      {{ formatter.currency(cashMove.amount) }}
    </q-item-section>
    <q-item-section
      v-if="cashMove.moveType != 'Inicio de Caja' && cashMoves.isOpen"
      side
    >
      <q-btn
        dense
        flat
        icon="clear"
        color="grey-7"
        @click="remove(cashMove._id)"
        :loading="loading"
      />
    </q-item-section>
  </q-item>
</template>

<script setup>
import { inject, ref } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps(['cashMove'])

const cashMoves = inject('cashMoves')
const quasar = inject('quasar')
const loading = ref(false)

const remove = async id => {
  loading.value = true
  quasar
    .dialog({
      title: 'Remover Movimiento',
      message: `¿Estas seguro de remover "${
        props.cashMove.description
      }" ${formatter.currency(props.cashMove.amount)}?`,
      cancel: true
    })
    .onOk(async () => {
      await cashMoves.delete(id)
    })
  loading.value = false
}
</script>
