<script setup>
import { onMounted, ref } from 'vue'
import { usePos } from 'stores/pos'
import notify from 'tools/notify'

const pos = usePos()
const loading = ref(false)

const transbank = {
  keys: {
    success: 'Transbank: Carga de llaves OK'
  },
  detail: {
    success: 'Transbank: Detalle de ventas OK'
  },
  totals: {
    success: 'Transbank: Totales OK'
  },
  close: {
    success: 'Transbank: Cierre de día OK'
  },
  normal: {
    success: 'Transbank: Modo Normal OK'
  }
}

onMounted(() => {
  if (window.main) {
    if (!pos.transbankStatus) window.main.send('transbank-connect')

    window.main.on('transbank-status', response => {
      if (response == 'Transbank: Conectado') {
        pos.transbankStatus = true
        notify.positive(response)
      } else {
        pos.transbankStatus = false
        notify.negative(response)
      }
      loading.value = false
    })
    window.main.on('transbank-last', response => {
      if (typeof response == 'string') {
        notify.negative(response)
      }
      loading.value = false
    })

    for (let action of Object.keys(transbank)) {
      window.main.on('transbank-' + action, response => {
        if (response == transbank[action].success) {
          notify.positive(response)
        } else {
          notify.negative(response)
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
