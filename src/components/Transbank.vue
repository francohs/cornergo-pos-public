<script setup>
import { onMounted, ref } from 'vue'
import { usePos } from 'stores/pos'
import notify from 'tools/notify'

const pos = usePos()
const loading = ref(false)
const transbankActions = ['keys', 'last', 'detail', 'totals', 'close', 'normal']

onMounted(() => {
  if (window.main) {
    if (!pos.transbankStatus) window.main.send('transbank-connect')

    window.main.on('transbank-status', response => {
      console.log(response)
      if (response.success) {
        pos.transbankStatus = true
        notify.positive(response.message)
      } else {
        pos.transbankStatus = false
        notify.negative(response.message)
      }
      loading.value = false
    })

    for (let action of transbankActions) {
      window.main.on('transbank-' + action, response => {
        console.log(response)
        if (response.success) {
          notify.positive(response.message)
        } else {
          notify.negative(response.message)
        }
        loading.value = false
      })
    }
  }
})

function transbankAction(action) {
  loading.value = true
  window.main.send('transbank-' + action)
}
</script>

<template>
  <q-btn
    icon="point_of_sale"
    size="sm"
    :color="pos.transbankStatus ? 'green-13' : 'red-13'"
    flat
    :loading="loading"
  >
    <q-menu :offset="[65, 13]">
      <q-list v-if="!pos.transbankStatus" style="min-width: 230px">
        <q-item-label header>TRANSBANK INTEGRADO</q-item-label>
        <ItemMenu
          label="Conectar"
          icon="power_settings_new"
          @click="transbankAction('connect')"
        />
      </q-list>

      <q-list v-else style="min-width: 230px">
        <q-item-label header>TRANSBANK INTEGRADO</q-item-label>
        <ItemMenu
          label="Probar Conexión"
          icon="sync_alt"
          @click="transbankAction('status')"
        />
        <ItemMenu
          label="Carga de LLaves"
          icon="key"
          @click="transbankAction('keys')"
        />
        <q-separator />
        <ItemMenu
          label="Última Venta"
          icon="article"
          @click="transbankAction('last')"
        />
        <ItemMenu
          label="Detalle de Ventas"
          icon="list_alt"
          @click="transbankAction('detail')"
        />
        <ItemMenu
          label="Total de Ventas"
          icon="request_quote"
          @click="transbankAction('totals')"
        />
        <ItemMenu
          label="Cerrar Día"
          icon="cancel"
          @click="transbankAction('close')"
        />
        <q-separator />
        <ItemMenu
          label="Modo Normal"
          icon="touch_app"
          @click="transbankAction('normal')"
        />
      </q-list>
    </q-menu>
  </q-btn>
</template>
