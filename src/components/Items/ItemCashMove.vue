<script setup>
import { inject, ref, computed } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps(['move'])

const cashMoves = inject('cashMoves')
const quasar = inject('quasar')
const dialog = ref(false)
const loading = ref(false)

const icons = {
  'Inicio de Caja': 'check_circle_outline',
  'Cierre de Caja': 'check_circle_outline',
  'Pago a Proveedor': 'local_shipping',
  'Otro Ingreso': 'arrow_forward',
  'Otro Egreso': 'arrow_back',
  'Abono Cliente': 'payments'
}

const colors = {
  'Inicio de Caja': 'positive',
  'Cierre de Caja': 'negative'
}

const isOpenClose = computed(
  () =>
    props.move.moveType == 'Inicio de Caja' ||
    props.move.moveType == 'Cierre de Caja'
)

const remove = async () => {
  loading.value = true
  await cashMoves.removeItem(
    'moves',
    props.move._id,
    'Movimiento eliminado con éxito'
  )
  loading.value = false
}
</script>

<template>
  <q-item
    class="q-pl-none q-pr-sm"
    :class="{
      'text-bold q-my-sm': isOpenClose
    }"
  >
    <q-item-section side>
      <q-icon
        :name="icons[move.moveType]"
        :color="isOpenClose ? colors[move.moveType] : ''"
      />
    </q-item-section>
    <q-item-section side>
      {{ formatter.time(move.createdAt) }}
    </q-item-section>
    <q-item-section>
      {{ move.description }}
    </q-item-section>
    <q-item-section side>
      {{ formatter.currency(move.amount) }}
    </q-item-section>
    <q-item-section
      v-if="move.moveType != 'Inicio de Caja' && cashMoves.isOpen"
      side
    >
      <q-btn dense flat icon="clear" color="grey-7" @click="dialog = true" />
    </q-item-section>
  </q-item>
  <Dialog
    v-model="dialog"
    title="Remover Movimiento"
    @confirm="remove"
    :loading="loading"
  >
    {{
      `¿Estas seguro de remover "${
        props.move.description
      }" ${formatter.currency(props.move.amount)}?`
    }}
  </Dialog>
</template>
