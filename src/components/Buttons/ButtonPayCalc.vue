<template>
  <div>
    <q-btn
      flat
      label="CALCULAR CHEQUES"
      :disable="!date"
      :class="{ 'text-primary': date }"
      @click="payCalc"
      :loading="loading"
    /><q-tooltip v-if="!date" :delay="300"
      >Primero selecciona la fecha de emisión</q-tooltip
    >
  </div>
  <Dialog title="Calculo de Cheques" v-model="dialog" noFooter :width="800">
    <q-table
      separator="cell"
      hide-bottom
      :rows="pays"
      :columns="[
        { label: 'PROVEEDOR', field: 'providerName', align: 'left' },
        { label: 'FORMA PAGO', field: 'paymentMethod', align: 'center' },
        {
          label: 'VENCIMIENTO',
          field: 'expirationDate',
          align: 'center',
          format: val => formatter.localDate(val)
        },
        {
          label: 'MONTO TOTAL',
          field: 'totalAmount',
          format: val => formatter.currency(val)
        }
      ]"
    />
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import formatter from 'tools/formatter'

const props = defineProps(['date'])

const dialog = ref(false)
const loading = ref(false)
const pays = ref([])

const payCalc = async () => {
  try {
    loading.value = true
    const { data } = await api.post('receiveddtes/query', {
      query: {
        date: {
          field: 'emissionDate',
          value: props.date
        }
      },
      select: ['providerName', 'expirationDate', 'paymentMethod', 'totalAmount']
    })

    pays.value = data.docs.reduce((acc, val) => {
      const index = acc.findIndex(
        target => target.providerName == val.providerName
      )
      if (index > -1) {
        acc[index].totalAmount = acc[index].totalAmount + val.totalAmount
        return [...acc]
      } else {
        if (!val.expirationDate) val.expirationDate = new Date()
        if (!val.paymentMethod) val.paymentMethod = 'Contado'
        return [...acc, val]
      }
    }, [])
  } catch (error) {
    throw error
  } finally {
    loading.value = false
    dialog.value = true
  }
}
</script>
