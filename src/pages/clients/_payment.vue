<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePayments } from 'stores/payments'

const router = useRouter()
const route = useRoute()

const payments = usePayments()

const inputPayAmount = ref(null)
const btnCreatePayment = ref(null)

const payment = reactive({
  client: route.params.id,
  payType: 'Efectivo',
  amount: ''
})

const payTypes = ref([
  'Efectivo',
  'Tarjeta de Debito',
  'Tarjeta de Credito',
  'Trasferencia',
  'Cheque'
])

const createPayment = () => {
  payments.create(payment, 'Abono ingresado con éxito')
  router.go(-1)
}
</script>

<template>
  <PageResponsive>
    <Form @submit="" class="q-pa-lg">
      <div class="row items-center justify-between q-pb-lg">
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
            @click="createPayment"
            :loading="payments.saving"
          />
        </div>
      </div>
    </Form>
  </PageResponsive>
</template>
