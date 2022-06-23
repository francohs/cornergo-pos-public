<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePayments } from 'stores/payments'
import formatter from 'tools/formatter'

const route = useRoute()

const payments = usePayments()
const page = ref(1)
const rowsPerPage = 5
const pages = ref(1)

onMounted(async () => {
  await getDocs()
  pages.value = Math.ceil(payments.count / rowsPerPage)
})

const getDocs = async () => {
  await payments.getQueryDocs({
    query: {
      equal: { client: route.params.id }
    },
    sort: { createdAt: -1 },
    pagination: {
      page: page.value,
      rowsPerPage
    }
  })
}

const changePage = async () => {
  await getDocs()
}

const payIcons = {
  Efectivo: 'payments',
  'Tarjeta de Debito': 'credit_card',
  'Tarjeta de Credito': 'credit_card',
  Transferencia: 'local_atm',
  Cheque: 'local_atm'
}
</script>

<template>
  <PageResponsive :maxWidth="650">
    <div class="q-pa-lg">
      <q-linear-progress
        indeterminate
        class="absolute-top"
        v-if="payments.loading"
      />

      <div class="row items-center q-mb-lg">
        <ButtonBack />

        <div class="text-h5">Historial de Abonos</div>
      </div>

      <q-list v-if="payments.docs.length > 0" bordered separator>
        <q-item
          v-for="payment of payments.docs"
          :key="payment._id"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-avatar
              rounded
              color="primary"
              text-color="white"
              :icon="payIcons[payment.payType]"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>{{ payment.payType }}</q-item-label>
            <q-item-label>{{
              formatter.datetime(payment.createdAt)
            }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label caption>Monto</q-item-label>
            <q-item-label>{{
              formatter.currency(payment.amount)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-pa-lg flex flex-center" v-if="pages > 1">
        <q-pagination
          v-model="page"
          :max="pages"
          @update:modelValue="changePage"
        />
      </div>

      <div
        v-if="payments.docs.length == 0"
        class="q-mt-xl text-center text-grey-7"
        v-show="!payments.loading"
      >
        Aún no tienes abonos
      </div>
    </div>
  </PageResponsive>
</template>
