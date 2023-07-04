<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import formatter from 'tools/formatter'
import notify from 'tools/notify'
import { usePos } from 'stores/pos'
const pos = usePos()

const connectLoading = ref(false)
const saleLoading = ref(false)
const lastSaleLoading = ref(false)
const refundLoading = ref(false)
const loadKeysLoading = ref(false)
const getDetailLoading = ref(false)
const getTotalsLoading = ref(false)
const statusLoading = ref(false)
const changeNormalLoading = ref(false)

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
  window.main.on('transbank-keys', response => {
    if (response == 'Transbank: Carga de llaves OK') {
      notify.positive(response)
    } else {
      notify.negative(response)
    }
    loadKeysLoading.value = false
  })
  window.main.on('transbank-sale', response => {
    if (typeof response == 'string') {
      notify.negative(response)
    } else {
      Object.assign(sale, response)
      saleAmount.value = ''
    }
    saleLoading.value = false
  })
  window.main.on('transbank-refund', response => {
    if (response == 'Transbank: Anulación OK') {
      notify.positive(response)
    } else {
      notify.negative(response)
    }
    refundLoading.value = false
  })
  window.main.on('transbank-last', response => {
    if (typeof response == 'string') {
      notify.negative(response)
    } else {
      Object.assign(sale, response)
    }
    lastSaleLoading.value = false
  })
  window.main.on('transbank-detail', response => {
    if (response == 'Transbank: Detalle de ventas OK') {
      notify.positive(response)
    } else {
      notify.negative(response)
    }
    getDetailLoading.value = false
  })
  window.main.on('transbank-totals', response => {
    if (response == 'Transbank: Totales OK') {
      notify.positive(response)
    } else {
      notify.negative(response)
    }
    getTotalsLoading.value = false
  })
  window.main.on('transbank-status', response => {
    if (response == 'Transbank: Conectado') {
      pos.transbankStatus = true
      notify.positive(response)
    } else {
      pos.transbankStatus = false
      notify.negative(response)
    }
    statusLoading.value = false
    connectLoading.value = false
  })
  window.main.on('transbank-normal', response => {
    if (response == 'Transbank: Modo Normal OK') {
      notify.positive(response)
    } else {
      notify.negative(response)
    }
    changeNormalLoading.value = false
  })
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

async function sendSale() {
  if (saleAmount.value) {
    saleLoading.value = true
    window.main.send('transbank-sale', parseInt(saleAmount.value), 12341234)
  }
}

async function sendRefund() {
  refundLoading.value = true
  window.main.send('transbank-refund', parseInt(operationNumber.value))
}

async function connect() {
  connectLoading.value = true
  window.main.send('transbank-connect')
}

async function loadKeys() {
  loadKeysLoading.value = true
  window.main.send('transbank-keys')
}

async function closeDay() {}

async function getDetail() {
  getDetailLoading.value = true
  window.main.send('transbank-detail')
}

async function getTotals() {
  getTotalsLoading.value = true
  window.main.send('transbank-totals')
}

async function getLastSale() {
  lastSaleLoading.value = true
  window.main.send('transbank-last')
}

async function changeNormalMode() {
  changeNormalLoading.value = true
  window.main.send('transbank-normal')
}

async function getStatus() {
  statusLoading.value = true
  window.main.send('transbank-status')
}
</script>

<template>
  <LayoutPage class="q-pa-md">
    <div class="full-height">
      <div class="row full-height q-px-lg">
        <q-card class="full-width row justify-center q-px-lg q-pt-xl">
          <div class="full-width row">
            <div class="col-5 offset-2">
              <div class="text-h4 text-grey-8 q-mb-lg">
                CASOS TRANSACCIONALES
              </div>
              <div class="row items-top q-mb-md">
                <div class="text-h5 text-grey-8 q-mr-md q-mb-md">
                  Realizar Venta:
                </div>
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
                    label="Enviar"
                    color="primary"
                    @click="sendSale"
                    :loading="saleLoading"
                  />
                </div>
              </div>

              <div class="row items-top">
                <div class="text-h5 text-grey-8 q-mr-md q-mb-md">
                  Realizar Anulación:
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
                    label="Enviar"
                    color="primary"
                    @click="sendRefund"
                    :loading="refundLoading"
                  />
                </div>
              </div>

              <q-card
                style="width: 500px; height: 500px"
                class="q-mt-xl q-pa-md text-h6 text-grey-8"
              >
                <div class="text-bold">ÚLTIMA VENTA</div>
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

                <q-btn
                  label="CONNECTAR"
                  icon="power_settings_new"
                  color="positive"
                  @click="connect"
                  class="q-mb-md"
                  :loading="connectLoading"
                />

                <q-btn
                  label="CARGA DE LLAVES"
                  icon="key"
                  color="positive"
                  @click="loadKeys"
                  class="q-mb-md"
                  :loading="loadKeysLoading"
                />

                <q-btn
                  label="PROBAR CONEXIÓN"
                  icon="sync_alt"
                  color="positive"
                  @click="getStatus"
                  class="q-mb-md"
                  :loading="statusLoading"
                />

                <q-btn
                  label="CAMBIAR A MODO NORMAL"
                  icon="touch_app"
                  color="grey-6"
                  @click="changeNormalMode"
                  class="q-mb-md"
                  :loading="changeNormalLoading"
                />

                <q-btn
                  label="ÚLTIMA VENTA"
                  icon="article"
                  color="primary"
                  @click="getLastSale"
                  class="q-mb-md"
                  :loading="lastSaleLoading"
                />

                <q-btn
                  label="DETALLE DE VENTAS"
                  icon="list_alt"
                  color="primary"
                  @click="getDetail"
                  class="q-mb-md"
                  :loading="getDetailLoading"
                />

                <q-btn
                  label="TOTAL DE VENTAS"
                  icon="request_quote"
                  color="primary"
                  @click="getTotals"
                  class="q-mb-md"
                  :loading="getTotalsLoading"
                />

                <q-btn
                  label="CERRAR DÍA"
                  icon="cancel"
                  color="negative"
                  @click="closeDay"
                  class="q-mb-md"
                />
              </div>
            </div>
          </div>
        </q-card>
      </div></div
  ></LayoutPage>
</template>
