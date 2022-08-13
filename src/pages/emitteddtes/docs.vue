<script setup>
import { onMounted, provide, ref } from 'vue'
import { useEmittedDtes } from 'stores/emitteddtes'
import formatter from 'tools/formatter'

const emittedDtes = useEmittedDtes()
provide(emittedDtes.$id, emittedDtes)

const page = ref(1)
const rowsPerPage = 10
const pages = ref(1)

onMounted(async () => {
  await getDocs()
  pages.value = Math.ceil(emittedDtes.count / rowsPerPage)
})

const getDocs = async () => {
  await emittedDtes.getQueryDocs({
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
    <div class="q-pa-lg q-px-xs-md q-px-md-xl">
      <q-linear-progress
        indeterminate
        class="absolute-top"
        v-if="emittedDtes.loading"
      />

      <div class="text-h5 q-mb-md">Historial de Ventas</div>

      <q-list v-if="emittedDtes.docs.length > 0" bordered separator>
        <q-item
          v-for="emittedDte of emittedDtes.docs"
          :key="emittedDte._id"
          class="q-py-sm"
          clickable
          :to="{ name: 'emitteddtes/:id', params: { id: emittedDte._id } }"
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
            <q-item-label caption
              >BOLETA: {{ emittedDte.number }}
            </q-item-label>
            <q-item-label>{{
              formatter.datetime(emittedDte.createdAt)
            }}</q-item-label>
            <q-item-label caption
              >Vendedor {{ emittedDte.sellerName }}</q-item-label
            >
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
          :max-pages="5"
          @update:modelValue="changePage"
        />
      </div>

      <div
        v-if="emittedDtes.docs.length == 0"
        class="q-mt-xl text-center text-grey-7"
        v-show="!emittedDtes.loading"
      >
        Aún no tienes ventas
      </div>
    </div>
  </PageResponsive>
</template>
