<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import formatter from 'tools/formatter'
import notify from 'tools/notify'
import { usePos } from 'stores/pos'
const pos = usePos()

const transbank = reactive({
  connect: {
    success: 'Transbank: Conectado',
    loading: false,
    label: 'CONECTAR',
    icon: 'power_settings_new',
    color: 'positive'
  },
  status: {
    success: 'Transbank: Conectado',
    loading: false,
    label: 'PROBAR CONEXIÓN',
    icon: 'sync_alt',
    color: 'positive'
  },
  keys: {
    success: 'Transbank: Carga de llaves OK',
    loading: false,
    label: 'CARGA DE LLAVES',
    icon: 'key',
    color: 'positive'
  },
  normal: {
    success: 'Transbank: Modo Normal OK',
    loading: false,
    label: 'CAMBIAR A MODO NORMAL',
    icon: 'touch_app',
    color: 'grey-6'
  },
  refund: {
    success: 'Transbank: Anulación OK',
    loading: false
  },
  detail: {
    success: 'Transbank: Detalle de ventas OK',
    loading: false,
    label: 'DETALLE DE VENTAS',
    icon: 'list_alt',
    color: 'primary'
  },
  totals: {
    success: 'Transbank: Totales OK',
    loading: false,
    label: 'TOTAL DE VENTAS',
    icon: 'request_quote',
    color: 'primary'
  },

  close: {
    success: 'Transbank: Cierre de día OK',
    loading: false,
    label: 'CERRAR DÍA',
    icon: 'cancel',
    color: 'grey-6'
  },
  sale: {
    loading: false
  },
  last: {
    loading: false
  }
})

const saleAmount = ref('')
const operationNumber = ref('')
const sale = reactive({
  realDate: '',
  realTime: '',
  ticket: '',
  authorizationCode: '',
  amount: '',
  sharesNumber: '',
  sharesAmount: '',
  last4Digits: '',
  operationNumber: '',
  cardType: '',
  cardBrand: ''
})

onMounted(() => {
  window.main.on('transbank-sale', response => {
    if (typeof response == 'string') {
      notify.negative(response)
    } else {
      Object.assign(sale, response)
      saleAmount.value = ''
    }
    transbank.sale.loading = false
  })
  window.main.on('transbank-last', response => {
    if (typeof response == 'string') {
      notify.negative(response)
    } else {
      Object.assign(sale, response)
    }
    transbank.last.loading = false
  })
  window.main.on('transbank-status', response => {
    if (response == transbank.status.success) {
      pos.transbankStatus = true
      notify.positive(response)
    } else {
      pos.transbankStatus = false
      notify.negative(response)
    }
    statusLoading.value = false
    connectLoading.value = false
  })

  for (let action of Object.keys(transbank)) {
    window.main.on('transbank-' + action, response => {
      if (response == transbank[action].success) {
        notify.positive(response)
      } else {
        notify.negative(response)
      }
      transbank[action].loading = false
    })
  }
})

const formatDate = computed(() => {
  return sale.realDate
    ? `${sale.realDate.slice(0, 2)}/${sale.realDate.slice(
        2,
        4
      )}/${sale.realDate.slice(4, 8)}`
    : ''
})

const formatTime = computed(() => {
  return sale.realTime
    ? `${sale.realTime.slice(0, 2)}:${sale.realTime.slice(
        2,
        4
      )}:${sale.realTime.slice(4, 6)}`
    : ''
})

function sendSale() {
  if (saleAmount.value) {
    transbank.sale.loading = true
    window.main.send('transbank-sale', parseInt(saleAmount.value), 12341234)
  }
}

function sendRefund() {
  transbank.refund.loading = true
  window.main.send('transbank-refund', parseInt(operationNumber.value))
}

function transbankAction(action) {
  transbank[action].loading = true
  window.main.send('transbank-' + action)
}
</script>

<template>
  <LayoutPage class="q-pa-md">
    <div class="full-height">
      <div class="row full-height q-px-lg">
        <q-card class="full-width row justify-center q-px-lg q-pt-xl">
          <div class="full-width row">
            <div class="col-5 offset-2">
              <div style="width: 500px">
                <div class="text-h4 text-grey-8 q-mb-lg">
                  CASOS TRANSACCIONALES
                </div>
                <div class="row items-top q-mb-md justify-end">
                  <div class="text-h5 text-grey-8 q-mr-md q-mb-md">VENTA:</div>
                  <Input
                    v-model="saleAmount"
                    label="Monto"
                    format="currency"
                    onlynumbers
                    dense
                    class="q-mr-md"
                  />
                  <div>
                    <q-btn
                      label="ENVIAR"
                      color="primary"
                      @click="sendSale"
                      :loading="transbank.sale.loading"
                    />
                  </div>
                </div>

                <div class="row items-top justify-end">
                  <div class="text-h5 text-grey-8 q-mr-md q-mb-md">
                    ANULACIÓN:
                  </div>
                  <Input
                    v-model="operationNumber"
                    label="Número Operación"
                    onlynumbers
                    dense
                    class="q-mr-md"
                  />
                  <div>
                    <q-btn
                      label="ENVIAR"
                      color="primary"
                      @click="sendRefund"
                      :loading="transbank.refund.loading"
                    />
                  </div>
                </div>
              </div>

              <q-card
                style="width: 500px; height: 500px"
                class="q-mt-xl q-pa-md text-h6 text-grey-8"
              >
                <div class="row justify-between">
                  <div class="text-bold">ÚLTIMA VENTA</div>
                  <q-btn
                    label="CONSULTAR ÚLTIMA VENTA"
                    icon="article"
                    color="primary"
                    @click="transbankAction('last')"
                    :loading="transbank.last.loading"
                    size="sm"
                    rounded
                  />
                </div>

                <div class="q-gutter-sm" v-if="sale.ticket">
                  <div>Fecha: {{ formatDate }}</div>
                  <div>Hora: {{ formatTime }}</div>
                  <div>
                    Número de Operación: {{ parseInt(sale.operationNumber) }}
                  </div>
                  <div>Codigo Autorizacion: {{ sale.authorizationCode }}</div>
                  <div>Ticket: {{ sale.ticket }}</div>
                  <div>Monto: {{ formatter.currency(sale.amount) }}</div>
                  <div>Número de Cuotas: {{ sale.sharesNumber }}</div>
                  <div>
                    Monto de Cuota: {{ formatter.currency(sale.sharesAmount) }}
                  </div>
                  <div>Tipo de Tarjeta: {{ sale.cardType }}</div>
                  <div>Marca de Tarjeta: {{ sale.cardBrand }}</div>
                  <div>Último 4 digitos: {{ sale.last4Digits }}</div>
                </div>
              </q-card>
            </div>

            <div class="col-5 row">
              <div class="column">
                <div class="text-h4 text-grey-8 q-mb-lg">
                  CASOS ADMINISTRATIVOS
                </div>

                <div v-for="action of Object.keys(transbank)">
                  <q-btn
                    v-if="transbank[action].label"
                    :label="transbank[action].label"
                    :icon="transbank[action].icon"
                    :color="transbank[action].color"
                    @click="transbankAction(action)"
                    :loading="transbank[action].loading"
                    class="q-mb-md full-width"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card>
      </div></div
  ></LayoutPage>
</template>
