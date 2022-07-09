<script setup>
import { useCashMoves } from 'stores/cashmoves'
import { useAuth } from 'stores/auth'
import { provide, onMounted } from 'vue'
import formatter from 'tools/formatter'
import { useQuasar } from 'quasar'

const cashMoves = useCashMoves()
provide(cashMoves.$id, cashMoves)
const auth = useAuth()
provide(auth.$id, auth)
const quasar = useQuasar()
provide('quasar', quasar)

onMounted(async () => await cashMoves.getDocs())

const closeCashBox = () => {
  quasar
    .dialog({
      title: 'Cierre de Caja',
      message: '¿Estas seguro de realizar el cierre de caja?',
      cancel: true
    })
    .onOk(async () => {
      await cashMoves.closeCashBox(auth.user._id)
      // auth.logout()
    })
}
</script>

<template>
  <LayoutPage :loading="cashMoves.loading" class="q-pa-md">
    <div class="full-height column">
      <div class="row col q-px-lg">
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
              class="full-width row justify-between text-h5 text-bold q-my-lg"
            >
              <div>
                {{ cashMoves.isOpen ? '' : 'Último ' }}Arqueo
                {{ cashMoves.isOpen ? '(Abierto)' : '(Cerrado)' }}
              </div>
              <div v-if="cashMoves.docs.length > 0">
                {{ formatter.localDate(cashMoves.docs[0].createdAt) }}
              </div>
            </div>

            <div class="row items-baseline justify-between">
              <div class="q-pa-none" style="font-size: 20px">
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
                v-for="cashMove of cashMoves.docs"
                :cashMove="cashMove"
                :key="cashMove._id"
              />
            </q-list>

            <div class="row justify-end q-mt-lg">
              <q-btn
                v-if="cashMoves.isOpen"
                label="CERRAR CAJA"
                @click="closeCashBox"
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
