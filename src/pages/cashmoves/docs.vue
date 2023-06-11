<script setup>
import { useCashMoves } from 'stores/cashmoves'
import { useAuth } from 'stores/auth'
import { provide, onMounted, reactive, ref } from 'vue'
import formatter from 'tools/formatter'
import { useQuasar } from 'quasar'

const cashMoves = useCashMoves()
provide(cashMoves.$id, cashMoves)
const auth = useAuth()
provide(auth.$id, auth)
const quasar = useQuasar()
provide('quasar', quasar)

const cashMove = reactive({
  cash: {
    count: 0,
    amount: 0
  },
  debit: {
    count: 0,
    amount: 0
  },
  credit: {
    count: 0,
    amount: 0
  },
  transfer: {
    count: 0,
    amount: 0
  },
  clientCredit: {
    count: 0,
    amount: 0
  },
  totalSales: {
    count: 0,
    amount: 0
  }
})
const dialog = ref(false)
const loadingClose = ref(false)

onMounted(async () => {
  await cashMoves.getLast()
  Object.assign(cashMove, cashMoves.doc)
})

const closeCashMoves = async () => {
  try {
    loadingClose.value = true
    await cashMoves.closeCashMoves()
    Object.assign(cashMove, cashMoves.doc)
    window.main.send('close-cash-close', JSON.parse(JSON.stringify(cashMove)))
  } catch (error) {
    throw error
  } finally {
    loadingClose.value = false
    dialog.value = false
  }
}
</script>

<template>
  <Dialog
    v-model="dialog"
    title="Cierre de Caja"
    @confirm="closeCashMoves"
    :loading="loadingClose"
  >
    ¿Estas seguro de realizar el cierre de caja?
  </Dialog>

  <LayoutPage :loading="cashMoves.loading" class="q-pa-md">
    <div class="full-height">
      <div class="row full-height q-px-lg">
        <q-card class="full-width row justify-center q-px-lg q-pt-lg">
          <div class="col-6 column">
            <q-btn
              label="INICIAR NUEVA CAJA"
              :to="{ name: 'cashmoves/create' }"
              class="q-px-sm"
              color="positive"
              rounded
              dense
              v-if="!cashMoves.isOpen"
            />
            <div
              v-if="cashMove"
              class="row justify-end text-h5 text-bold q-mt-md"
            >
              <div>
                {{ formatter.localDate(cashMove.createdAt) }}
              </div>
            </div>
            <div
              v-if="cashMove.user"
              class="row justify-between items-end q-mb-lg"
            >
              <div class="text-h5 text-bold">
                {{ cashMoves.isOpen ? '' : 'Último ' }}Arqueo
                {{ cashMoves.isOpen ? '(Abierto)' : '(Cerrado)' }}
              </div>
              <div style="font-size: 18px">
                {{ cashMove.user.name }}
                {{ cashMove.user.lastName }}
              </div>
            </div>
            <div class="row items-baseline justify-between">
              <div class="q-pa-none text-bold" style="font-size: 20px">
                Movimientos de efectivo
              </div>

              <q-btn
                v-if="cashMoves.isOpen"
                label="INGRESAR MOVIMIENTO"
                :to="{ name: 'cashmoves/create' }"
                class="q-px-sm"
                color="positive"
                icon="add"
                rounded
                dense
              />
            </div>

            <q-separator spaced />
            <q-list class="full-width overflow-hidden">
              <ItemCashMove
                v-if="cashMoves.isOpen"
                :move="{
                  moveType: 'Inicio de Caja',
                  description: 'Inicio de Caja',
                  amount: cashMove.openAmount,
                  createdAt: cashMove.createdAt
                }"
              />
              <ItemCashMove
                v-for="move of cashMoves.doc.moves"
                :move="move"
                :key="move._id"
              />
            </q-list>

            <div v-if="!cashMoves.isOpen" class="q-mt-lg">
              <div class="q-pa-none text-bold" style="font-size: 20px">
                Cálculo cierre de caja
              </div>
              <q-separator spaced />
              <ItemCashMove
                :move="{
                  moveType: 'Inicio de Caja',
                  description: 'Inicio de Caja',
                  amount: cashMove.openAmount,
                  createdAt: cashMove.createdAt
                }"
              />
              <ItemCashMove
                :move="{
                  moveType: 'Otro Ingreso',
                  description: 'Pagos en Efectivo',
                  amount: cashMove.cash.amount
                }"
              />
              <ItemCashMove
                :move="{
                  moveType: 'Otro Ingreso',
                  description: 'Total Otros Ingresos',
                  amount: cashMove.totalInputs
                }"
              />
              <ItemCashMove
                :move="{
                  moveType: 'Otro Egreso',
                  description: 'Total Otros Egresos',
                  amount: cashMove.totalOutputs
                }"
              />
              <ItemCashMove
                :move="{
                  moveType: 'Cierre de Caja',
                  description: 'Cierre de Caja',
                  amount: cashMove.closeAmount,
                  createdAt: cashMove.updatedAt
                }"
              />
            </div>

            <div v-if="!cashMoves.isOpen" class="q-mt-lg">
              <q-expansion-item
                label="Resumen de ventas"
                header-class="q-pl-none text-bold"
                header-style="font-size: 20px"
                ><q-separator spaced />
                <div>
                  <ItemCashMove
                    :move="{
                      moveType: 'Inicio de Caja',
                      description: `Total Ventas (${cashMove.totalSales.count})`,
                      amount: cashMove.totalSales.amount
                    }"
                  />
                  <ItemCashMove
                    :move="{
                      moveType: 'Otro Ingreso',
                      description: `Efectivo (${cashMove.cash.count})`,
                      amount: cashMove.cash.amount
                    }"
                  />
                  <ItemCashMove
                    :move="{
                      moveType: 'Otro Ingreso',
                      description: `Tarjeta Débito (${cashMove.debit.count})`,
                      amount: cashMove.debit.amount
                    }"
                  />
                  <ItemCashMove
                    :move="{
                      moveType: 'Otro Ingreso',
                      description: `Tarjeta Crédito (${cashMove.credit.count})`,
                      amount: cashMove.credit.amount
                    }"
                  />
                  <ItemCashMove
                    :move="{
                      moveType: 'Otro Ingreso',
                      description: `Total Tarjetas (${
                        cashMove.debit.count + cashMove.credit.count
                      })`,
                      amount: cashMove.debit.amount + cashMove.credit.amount
                    }"
                  />
                  <ItemCashMove
                    :move="{
                      moveType: 'Otro Ingreso',
                      description: `Trasferencias (${cashMove.transfer.count})`,
                      amount: cashMove.transfer.amount
                    }"
                  />
                  <ItemCashMove
                    :move="{
                      moveType: 'Otro Ingreso',
                      description: `Cédito Cliente (${cashMove.clientCredit.count})`,
                      amount: cashMove.clientCredit.amount
                    }"
                  />
                </div>
              </q-expansion-item>
            </div>

            <div class="row justify-end q-mt-lg">
              <q-btn
                v-if="cashMoves.isOpen"
                label="CERRAR CAJA"
                @click="dialog = true"
                class="q-px-sm"
                color="negative"
                icon="close"
                rounded
                dense
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </LayoutPage>
</template>
