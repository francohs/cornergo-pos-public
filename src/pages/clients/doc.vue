<script setup>
import { useClients } from 'stores/clients'
import { onMounted, provide, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const clients = useClients()
const route = useRoute()
const router = useRouter()
const id = route.params.id
const client = ref({})
const dialogPassword = ref(false)
const password1 = ref('')
const password2 = ref('')

provide(clients.$id, clients)

onMounted(async () => {
  await clients.getDoc(id)
  client.value = { ...clients.doc }
})

async function updatePasswornd() {
  await clients.updatePassword(id, { password: password1.value })
  dialogPassword.value = false
  password1.value = ''
  password2.value = ''
}
</script>

<template>
  <PageResponsive :loading="clients.loading">
    <FormSave :storeId="clients.$id" :id="id" :doc="client">
      <div class="row items-center justify-between q-pb-lg">
        <div class="row">
          <ButtonBack />
          <div class="text-h5">Datos Cliente</div>
        </div>
        <div>
          <q-toggle
            v-model="client.isCredit"
            color="green"
            label="Usa Crédito"
            disable
          />
          <q-toggle
            v-model="client.active"
            color="green"
            label="Activo"
            disable
          />
        </div>
      </div>

      <RowMultiCols>
        <InputRead
          required
          v-model="client.name"
          label="Nombre y Apellido"
          class="col"
        />
        <InputRead
          required
          onlynumbers
          format="rut"
          v-model="client.rut"
          label="RUT"
          class="col"
        />
      </RowMultiCols>

      <InputRead label="Dirección" v-model="client.address" class="fit" />

      <RowMultiCols>
        <InputRead
          required
          email
          label="Correo"
          v-model="client.email"
          class="col"
        /><InputRead
          onlynumbers
          label="Teléfono"
          v-model="client.phone"
          class="col"
        />
      </RowMultiCols>

      <RowMultiCols>
        <InputRead
          label="Saldo"
          v-model="client.balance"
          format="currency"
          class="col"
        />
        <InputRead
          label="Crédito Máximo"
          v-model="client.maxCredit"
          format="currency"
          class="col"
        />
      </RowMultiCols>

      <div class="row justify-between q-mt-md">
        <div>
          <q-btn
            label="ABONAR"
            color="positive"
            @click="router.push({ name: 'clientPayment' })"
          />
          <q-btn
            label="HISTORIAL ABONOS"
            class="q-ml-sm"
            @click="router.push({ name: 'clientPayments' })"
          />
        </div>

        <div>
          <q-btn
            label="HISTORIAL COMPRAS"
            @click="router.push({ name: 'clientPurchases' })"
          />
        </div>
      </div>
    </FormSave>
  </PageResponsive>
</template>
