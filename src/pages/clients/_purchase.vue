<script setup>
import { onMounted, provide, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useEmittedDtes } from 'stores/emittedDtes'
import formatter from 'tools/formatter'

const route = useRoute()

const emittedDtes = useEmittedDtes()
const id = route.params.purchaseId
const emittedDte = reactive({})

provide(emittedDtes.$id, emittedDtes)

onMounted(async () => {
  try {
    await emittedDtes.getDoc(id)
    Object.assign(emittedDte, emittedDtes.doc)
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <PageResponsive :loading="emittedDtes.loading">
    <div class="q-pa-lg">
      <div class="row items-center justify-between q-pb-lg text-h5">
        <div class="row">
          <ButtonBack />
          <div>Detalle Boleta: {{ emittedDte.number }}</div>
        </div>
        <div>Emisión: {{ formatter.datetime(emittedDte.createdAt) }}</div>
      </div>

      <div class="row col q-mb-lg">
        <q-card class="fit row q-px-md">
          <q-list bordered separator class="fit q-pa-sm">
            <ItemPos
              v-for="item of emittedDte.items"
              :item="item"
              :key="item._id"
              readonly
            />
          </q-list>
        </q-card>
      </div>

      <div class="q-px-sm">
        <div
          class="row justify-between text-h5 q-mb-lg"
          style="font-size: 20px"
        >
          <div>VENDEDOR: {{ emittedDte.sellerName }}</div>
          <div>VUELTO: {{ formatter.currency(emittedDte.changeAmount) }}</div>
          <div>TOTAL: {{ formatter.currency(emittedDte.totalAmount) }}</div>
        </div>

        <div class="text-h5 q-mb-md">Pagos</div>

        <q-list bordered separator>
          <q-item
            v-for="pay of emittedDte.pays"
            :key="pay.payType"
            class="q-py-md"
            style="font-size: 20px"
          >
            <q-item-section>
              <q-item-label>{{ pay.payType }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-item-label>{{
                formatter.currency(pay.amount)
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </PageResponsive>
</template>
