<script setup>
import { useClients } from 'stores/clients'
import { onMounted, provide } from 'vue'
import formatter from 'tools/formatter'

const clients = useClients()
provide(clients.$id, clients)

onMounted(async () => await clients.getDocs())
</script>

<template>
  <PageResponsive :loading="clients.loading" :maxWidth="650">
    <div class="q-pa-lg q-px-xs-md q-px-md-xl">
      <div class="row clients-center justify-between q-mb-md">
        <div class="text-h5">Clientes</div>
      </div>

      <q-list v-if="clients.docs.length > 0" bordered separator>
        <q-item
          clickable
          v-for="client of clients.docs"
          :key="client._id"
          class="q-py-md"
          :to="{ name: 'clients/:id', params: { id: client._id } }"
        >
          <q-item-section avatar>
            <q-avatar
              rounded
              color="primary"
              text-color="white"
              icon="person"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ client.name }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label caption>Saldo</q-item-label>
            <q-item-label>{{
              formatter.currency(client.balance)
            }}</q-item-label>
          </q-item-section>

          <!-- <q-item-section style="width: 200px" side>
            <div class="fit row">
              <div class="col-4 text-right">Saldo:</div>
              <div class="col-8 text-right">
                {{ formatter.currency(client.balance) }}
              </div>
            </div>
          </q-item-section> -->
        </q-item>
      </q-list>

      <div
        v-if="clients.docs.length == 0"
        class="q-mt-xl text-center text-grey-7"
      >
        Aún no tienes clients
      </div>
    </div>
  </PageResponsive>
</template>
