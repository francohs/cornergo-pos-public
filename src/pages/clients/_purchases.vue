<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEmittedDtes } from 'stores/emittedDtes'
import formatter from 'tools/formatter'

const route = useRoute()

const emittedDtes = useEmittedDtes()
const page = ref(1)
const rowsPerPage = 5
const pages = ref(1)

onMounted(async () => {
  await getDocs()
  pages.value = Math.ceil(emittedDtes.count / rowsPerPage)
})

const getDocs = async () => {
  await emittedDtes.getQueryDocs({
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
</script>

<template>
  <PageResponsive :maxWidth="650">
    <div class="q-pa-lg">
      <q-linear-progress
        indeterminate
        class="absolute-top"
        v-if="emittedDtes.loading"
      />

      <div class="row items-center q-mb-lg">
        <ButtonBack />

        <div class="text-h5">Historial de Compras</div>
      </div>

      <q-list v-if="emittedDtes.docs.length > 0" bordered separator>
        <q-item
          v-for="emittedDte of emittedDtes.docs"
          :key="emittedDte._id"
          class="q-py-md"
          clickable
          :to="{
            name: 'clientPurchase',
            params: { purchaseId: emittedDte._id }
          }"
        >
          <q-item-section avatar>
            <q-avatar
              rounded
              color="primary"
              text-color="white"
              icon="shopping_cart"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label caption>BOLETA: {{ emittedDte.number }}</q-item-label>
            <q-item-label>{{
              formatter.datetime(emittedDte.createdAt)
            }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label caption>TOTAL</q-item-label>
            <q-item-label>{{
              formatter.currency(emittedDte.totalAmount)
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
        v-if="emittedDtes.docs.length == 0"
        class="q-mt-xl text-center text-grey-7"
        v-show="!emittedDtes.loading"
      >
        Aún no tienes compras
      </div>
    </div>
  </PageResponsive>
</template>
