<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePayments } from 'stores/payments'
import { useClients } from 'stores/clients'
import { useCashMoves } from 'stores/cashmoves'
import Notify from 'tools/notify'
import formatter from 'tools/formatter'

const router = useRouter()
const route = useRoute()

const clientId = route.params.id

const payments = usePayments()
const clients = useClients()
const cashMoves = useCashMoves()

const inputPayAmount = ref(null)
const btnCreatePayment = ref(null)
const dialog = ref(false)

const payment = reactive({
  client: clientId,
  payType: 'Transferencia',
  amount: ''
})

const payTypes = ref([
  'Transferencia',
  'Tarjeta de Debito',
  'Tarjeta de Credito',
  'Efectivo',
  'Cheque'
])

const createPayment = async () => {
  if (payment.payType == 'Efectivo' && !cashMoves.isOpen) {
    Notify.warning('Para ingresar un abono en efectivo debes iniciar caja')
    return
  }
  await payments.create(payment, 'Abono ingresado con éxito')
  if (payment.payType == 'Efectivo') {
    await cashMoves.addItem(
      'moves',
      {
        moveType: 'Otro Ingreso',
        amount: payment.amount,
        description: `Abono ${clients.doc.name}`
      },
      'Abono añadido a otros ingresos'
    )
  }
  window.printer.printPayment({ ...clients.doc }, { ...payment })
  await clients.getDoc(clientId)
  router.go(-1)
}
</script>

<template>
  <Dialog
    v-model="dialog"
    title="Abono a cliente"
    @confirm="createPayment"
    :loading="payments.saving"
  >
    {{
      `¿Desea hace un abono con ${payment.payType} a ${
        clients.doc.name
      } por ${formatter.currency(payment.amount)}?`
    }}
  </Dialog>
  <PageResponsive>
    <Form @submit="" class="q-pa-lg">
      <div class="row items-center justify-between q-pb-lg">
        ñ
        <div class="row">
          <ButtonBack />

          <div class="text-h5">Ingresar Abono de Cliente</div>
        </div>
      </div>

      <div class="fit row justify-center q-px-lg q-py-xl">
        <div class="col-8 row q-gutter-y-md justify-center">
          <Select
            label="Forma de Pago"
            required
            v-model="payment.payType"
            :options="payTypes"
            @update:modelValue="inputPayAmount.$el.focus()"
            class="full-width"
          />
          <Input
            label="Monto"
            v-model="payment.amount"
            format="currency"
            required
            @keyup.enter="btnCreatePayment.$el.focus()"
            ref="inputPayAmount"
            class="full-width"
          />
          <q-btn
            label="INGRESAR ABONO"
            color="positive"
            ref="btnCreatePayment"
            :disable="!payment.payType || payment.amount <= 0"
            type="submit"
            class="full-width"
            @click="dialog = true"
          />
        </div>
      </div>
    </Form>
  </PageResponsive>
</template>
