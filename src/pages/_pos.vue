<script setup>
import { useAuth } from 'stores/auth'
import { usePos } from 'stores/pos'
import { useClients } from 'stores/clients'
import { useEmittedDtes } from 'stores/emitteddtes'
import { ref, nextTick, provide, watchEffect, watch } from 'vue'
import formatter from 'tools/formatter'
import notify from 'tools/notify'
import generateBarcode from 'pdf417'

const pos = usePos()
provide(pos.$id, pos)
const clients = useClients()
provide(clients.$id, clients)
const emittedDtes = useEmittedDtes()
const auth = useAuth()

const dteTypes = ref(['Boleta Electronica'])
const payTypes = ref([
  'Tarjeta de Debito',
  'Efectivo',
  'Tarjeta de Credito',
  'Transferencia',
  'Credito Cliente'
])
const loading = ref(false)

const inputPay = ref(null)
const btnPrint = ref(null)
const selectSearchProduct = ref(null)
const selectClient = ref(null)
const selectPayType = ref(null)
const scrollRef = ref(null)
const cardRef = ref(null)

const focus = async compRef => {
  await nextTick()
  if (compRef.value) {
    compRef.value.$el.focus()
  } else {
    compRef.$el.focus()
  }
}

const setPayType = payType => {
  if (payType == 'Credito Cliente') {
    pos.pays = []
  }

  if (payType != 'Credito Cliente') {
    focusInputPay()
  }
}

const focusInputPay = () => {
  pos.payAmount = pos.roundedTotal - pos.totalPay
  focus(inputPay)
}

const enterInputPay = () => {
  if (pos.payAmount == '') {
    pos.payAmount = pos.roundedTotal - pos.totalPay
  } else if (parseInt(pos.payAmount) <= 20) {
    pos.payAmount = pos.payAmount + '000'
  } else if (pos.payAmount.length > 6) {
    notify.warning('Excede pago máximo')
    pos.payAmount = ''
    return
  }

  pos.addPay(pos.payType, pos.payAmount)

  if (pos.isTotalReach) focus(btnPrint)
}

const setClient = async name => {
  if (!name) {
    pos.client = null
    pos.pays = []
    return
  }
  await clients.findDoc({ name })
  pos.client = clients.doc
  pos.addPay(pos.payType, pos.roundedTotal)
  focus(btnPrint)
}

const loadItems = () => {
  pos.loadItems()
  focus(selectSearchProduct)
}

const removePay = () => {
  if (pos.payType == 'Credito Cliente') {
    pos.client = null
  }
  focus(inputPay)
}

const printDte = async () => {
  if (window.printer) {
    if (pos.pays.find(p => p.payType == 'Efectivo')) {
      window.printer.cashdraw()
    }
  }

  const dataToBsale = {
    dteType: pos.dteType,
    client: pos.client,
    sellerName: `${auth.user.name} ${auth.user.lastName}`,
    items: pos.items.map(item => ({
      ...item,
      subtotal: Math.round(item.price * item.quantity)
    })),
    pays: pos.pays,
    totalPay: pos.totalPay,
    changeAmount: pos.changeAmount
  }

  console.log(dataToBsale)

  const dte = await emittedDtes.create(dataToBsale)
  // console.log(dte)

  if (window.printer) {
    if (
      !pos.client ||
      (pos.client && pos.client.dteType == 'Boleta Electronica')
    ) {
      window.printer.printDte(
        { ...dte, roundedTotal: pos.roundedTotal },
        generateBarcode(dte.ted, 1, 0.5)
      )
    }
  }

  pos.clearAll()
  focus(selectSearchProduct)
}

watchEffect(() => {
  if (pos.roundedTotal == 0) focus(selectSearchProduct)
})

watch(
  () => scrollRef.value && scrollRef.value.getScroll().verticalSize,
  () => {
    scrollRef.value.setScrollPercentage('vertical', 1)
  }
)
</script>

<template>
  <LayoutPage class="bg-grey-2">
    <div class="fit row">
      <div class="col">
        <div class="fit column">
          <div class="row q-pr-md q-pb-sm">
            <q-card class="fit row q-pa-md">
              <SelectSearchProduct
                @next="focusInputPay"
                class="fit"
                :loading="loading"
                autofocus
                ref="selectSearchProduct"
              />
            </q-card>
          </div>

          <q-card class="row col q-mr-md q-mb-sm" ref="cardRef">
            <q-scroll-area class="fit row q-px-md" ref="scrollRef">
              <q-list separator class="fit q-pa-sm" style="overflow: auto">
                <ItemPos
                  v-for="item of pos.items"
                  :item="item"
                  :key="item.code"
                />
              </q-list>
            </q-scroll-area>
          </q-card>

          <div class="row items-center q-pr-md q-pt-sm" style="height: 95px">
            <q-card class="fit row justify-between q-pa-lg">
              <div>
                <q-btn
                  label="BORRAR TODO"
                  icon="delete"
                  class="text-grey-8"
                  @click="pos.clearAll()"
                />
                <q-btn
                  label="GUARDAR COMPRA"
                  icon="save"
                  class="q-ml-sm text-grey-8"
                  @click="pos.saveItems()"
                  v-if="pos.savedItems.length == 0"
                />
                <q-btn
                  label="CARGAR COMPRA"
                  icon="publish"
                  color="primary"
                  class="q-ml-sm"
                  @click="loadItems"
                  v-else
                />
              </div>
              <div class="text-bold text-grey-9" style="font-size: 24px">
                <span class="q-mr-md">TOTAL</span>
                <span>{{ formatter.currency(pos.roundedTotal) }}</span>
              </div>
            </q-card>
          </div>
        </div>
      </div>

      <div style="width: 340px">
        <div class="fit column">
          <div class="row col q-pb-sm">
            <q-card class="full-width column q-pa-md">
              <Select
                label="Tipo de Documento"
                v-model="pos.dteType"
                :options="dteTypes"
                icon="receipt_long"
                class="q-mb-md"
              />

              <!-- @keyup.enter.prevent="focus(inputPay)" -->
              <Select
                label="Tipo de Pago"
                v-model="pos.payType"
                @update:modelValue="setPayType"
                :options="payTypes"
                icon="account_balance_wallet"
                class="select-text-lg q-mb-md"
                v-show="!pos.isTotalReach || pos.payType == 'Credito Cliente'"
              />

              <Input
                label="Monto de Pago"
                v-model="pos.payAmount"
                @keyup.enter="enterInputPay"
                icon="paid"
                stack-label
                onlynumbers
                input-style="font-size: 20px;"
                ref="inputPay"
                class="full-width"
                v-show="!pos.isTotalReach && pos.payType != 'Credito Cliente'"
              >
                <template v-slot:append>
                  <q-btn round dense flat icon="add" @click="enterInputPay" />
                </template>
              </Input>

              <SelectInputFetch
                label="Cliente"
                autofocus
                fetchAll
                :storeId="clients.$id"
                :modelValue="pos.client ? pos.client.name : null"
                @update:modelValue="setClient"
                field="name"
                icon="person"
                class="q-mb-md"
                ref="selectClient"
                v-if="pos.payType == 'Credito Cliente'"
              />
              <InputRead
                v-if="pos.client"
                format="currency"
                class="full-width"
                label="Saldo"
                icon="paid"
                :modelValue="pos.client.balance"
              />

              <div v-show="pos.pays.length > 0">
                <q-item-label header class="q-pb-none q-pl-sm"
                  >Pagos</q-item-label
                >
                <q-list class="full-width">
                  <ItemPay
                    v-for="pay of pos.pays"
                    :pay="pay"
                    :key="pay.payType"
                    @remove="removePay"
                  />
                </q-list>

                <div
                  class="text-bold text-grey-9 text-right q-mt-sm q-pr-sm"
                  style="font-size: 18px"
                >
                  <span class="q-mr-md">TOTAL PAGADO</span>
                  <span>{{ formatter.currency(pos.totalPay) }}</span>
                </div>
              </div>

              <q-space />

              <div
                class="text-bold text-grey-8 text-right q-pr-sm"
                style="font-size: 24px"
              >
                <span class="q-mr-md">VUELTO</span>
                <span>{{ formatter.currency(pos.changeAmount) }}</span>
              </div>
            </q-card>
          </div>

          <div class="row q-pt-sm" style="height: 95px">
            <q-card class="fit row q-pa-lg">
              <q-btn
                label="IMPRIMIR"
                icon="print"
                class="fit"
                color="primary"
                ref="btnPrint"
                @click="printDte"
                :loading="emittedDtes.saving"
                :disable="!pos.isTotalReach || pos.roundedTotal < 200"
              />
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </LayoutPage>
</template>
