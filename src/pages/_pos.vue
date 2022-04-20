<template>
  <LayoutPage>
    <div class="fit row">
      <div class="col">
        <div class="fit column">
          <div class="row q-pr-md q-pb-sm">
            <q-card class="fit row q-pa-md">
              <SelectSearchProduct
                @next="focus(inputPay)"
                class="fit"
                :loading="loading"
                autofocus
                ref="selectSearchProduct"
              />
            </q-card>
          </div>
          <div class="row col q-pr-md q-pb-sm">
            <q-card class="fit row q-px-md">
              <q-list bordered separator class="fit q-pa-sm">
                <ItemPos
                  v-for="item of pos.items"
                  :item="item"
                  :key="item._id"
                />
              </q-list>
            </q-card>
          </div>
          <div class="row items-center q-pr-md q-pt-sm" style="height: 95px">
            <q-card class="fit row justify-between q-pa-lg">
              <div>
                <q-btn
                  label="BORRAR TODO"
                  icon="delete"
                  class="text-grey-8"
                  @click="pos.resetAll()"
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
                <span>{{ formatter.currency(pos.total) }}</span>
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
                icon="receipt"
                class="q-mb-md"
              />

              <Select
                label="Tipo de Pago"
                :modelValue="pos.payType"
                @update:modelValue="setPayType"
                :options="payTypes"
                icon="account_balance_wallet"
                class="select-text-lg q-mb-md"
                v-show="!pos.isTotalReach"
              />

              <Input
                label="Monto de Pago"
                v-model="payAmount"
                @keyup.enter="enterInputPay"
                icon="paid"
                stack-label
                onlynumbers
                input-style="font-size: 20px;"
                ref="inputPay"
                class="full-width"
                v-show="!pos.isTotalReach && pos.payType != 'Crédito Cliente'"
              />

              <SelectInputFetch
                label="Cliente"
                autofocus
                fetchAll
                :storeId="clients.$id"
                v-model="client"
                @update:modelValue="setClient"
                field="name"
                icon="person"
                class="q-mb-md"
                v-show="pos.payType == 'Crédito Cliente'"
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
                    @remove="focus(inputPay)"
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
              />
              <!-- :disable="!pos.isTotalReach || pos.total == 0" -->
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </LayoutPage>
</template>

<script setup>
import { useAuth } from 'stores/auth'
import { usePos } from 'stores/pos'
import { useClients } from 'stores/clients'
import { useEmittedDtes } from 'stores/emitteddtes'
import { ref, nextTick, provide, watchEffect } from 'vue'
import formatter from 'tools/formatter'
import generateBarcode from 'pdf417'

const pos = usePos()
provide(pos.$id, pos)
const clients = useClients()
provide(clients.$id, clients)
const emittedDtes = useEmittedDtes()
const auth = useAuth()

const dteTypes = ref(['Boleta'])
const payTypes = ref([
  'Efectivo',
  'Tarjeta de Debito',
  'Tarjeta de Credito',
  'Credito Cliente',
  'Cheque'
])
const payAmount = ref('')

const loading = ref(false)
const searchProduct = ref(null)
const searchInput = ref('')
const client = ref(null)

const inputPay = ref(null)
const btnPrint = ref(null)
const selectSearchProduct = ref(null)

const focus = async compRef => {
  await nextTick()
  if (compRef.value) {
    compRef.value.$el.focus()
  } else {
    compRef.$el.focus()
  }
}

const setPayType = payType => {
  pos.setPayType(payType)

  if (payType != 'Crédito Cliente') {
    focus(inputPay)

    if (payType != 'Efectivo' || pos.totalPay > 0) {
      payAmount.value = pos.total - pos.totalPay
    }
  }
}

const enterInputPay = () => {
  if (payAmount.value == '') {
    payAmount.value = pos.total - pos.totalPay
  } else if (parseInt(payAmount.value) <= 20) {
    payAmount.value = payAmount.value + '000'
  }

  pos.addPay(parseInt(payAmount.value))
  payAmount.value = ''

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
  pos.addPay(pos.total)
  focus(btnPrint)
}

const loadItems = () => {
  pos.loadItems()
  focus(selectSearchProduct)
}

const printDte = async () => {
  // pos.createDte();
  // pos.resetAll()
  // focusRef('selectSearchProduct')

  const dte = await emittedDtes.create({
    dteType: pos.dteType,
    payType: pos.payType,
    client: pos.client,
    sellerName: `${auth.user.name} ${auth.user.lastName}`,
    items: pos.items.map(item => ({
      ...item,
      subtotal: Math.round(item.price * item.quantity)
    })),
    pays: pos.pays,
    totalPay: pos.totalPay,
    changeAmount: pos.changeAmount
  })

  // const dte = {
  //   number: 438531,
  //   dteType: 39,
  //   dteTypeName: 'Boleta',
  //   emissionDate: '2022-04-13T02:41:11.476Z',
  //   sellerName: 'Franco Hormazábal',
  //   items: [
  //     {
  //       code: '7802215303937',
  //       name: 'CHOCMAN BLACK',
  //       quantity: 1,
  //       price: 1200,
  //       subtotal: 1200
  //     }
  //   ],
  //   netAmount: 168,
  //   taxAmount: 32,
  //   exemptAmount: 0,
  //   totalAmount: 2000,
  //   pays: [{ payType: 'Efectivo', payAmount: 200 }],
  //   totalPay: 400,
  //   changeAmount: 50,
  //   ted: '<TED version="1.0"><DD><RE>76260131-1</RE><TD>39</TD><F>438531</F><FE>2022-04-13</FE><RR>66666666-6</RR><RSR>sin cliente</RSR><MNT>200</MNT><IT1>CHOCMAN BLACK</IT1><CAF version="1.0"><DA><RE>76260131-1</RE><RS>SERVICIOS DE INGENIERIA BIGVISION SPA</RS><TD>39</TD><RNG><D>400001</D><H>500000</H></RNG><FA>2021-12-24</FA><RSAPK><M>xYXAtfLMacMS5iugzBZDnUvo6hSez8tvtC4+AtAw7/Gz/yt7sBCy2H4iX/fEiedz3G+0VeOIVRiGG42FmIL+nw==</M><E>Aw==</E></RSAPK><IDK>300</IDK></DA><FRMA algoritmo="SHA1withRSA">IS/G1rlcF3n/2nCEVBx7a8pGtxXV5gEYfBAVK4O24WX8wXt09BXCphzPImMFH86UtEbjHUnSKyvHJX/tjueKPQ==</FRMA></CAF><TSTED>2022-04-12T22:41:13</TSTED></DD><FRMT algoritmo="SHA1withRSA">wbmddhePGAHoV02PRbObJSMVQwy4HMoE17cVOqm/9zO+N3I7YA1dKfEoyDU+2RQulzMklJ1cN5EPWFZCZQYa9Q==</FRMT></TED>',
  //   bsaleId: 457759,
  //   pdfUrl: 'https://app2.bsale.cl/view/12271/29e7853a0051.pdf?sfd=99',
  //   xmlUrl: 'https://api.bsale.cl/v1/12271/files/29e7853a0051.xml'
  // }

  window.printer.printDte(dte, generateBarcode(dte.ted, 1, 0.5))
}

watchEffect(() => {
  if (pos.total == 0) focus(selectSearchProduct)
})
</script>
