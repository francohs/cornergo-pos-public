<script setup>
import { reactive, provide, ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCashMoves } from 'stores/cashmoves'
import { useProviders } from 'stores/providers'
import { useAuth } from 'stores/auth'
import formatter from 'tools/formatter'

const router = useRouter()
const cashMoves = useCashMoves()
provide(cashMoves.$id, cashMoves)
const providers = useProviders()
provide(providers.$id, providers)
const quasar = useQuasar()

const moveTypes = ref([
  { icon: 'local_shipping', moveType: 'Pago a Proveedor' },
  { icon: 'arrow_forward', moveType: 'Otro Ingreso' },
  { icon: 'arrow_back', moveType: 'Otro Egreso' }
])

const auth = useAuth()
const provider = ref(null)
const dteNumber = ref('')
const dialog = ref(false)

const move = reactive({ moveType: null, amount: '', description: '' })

const cashMove = reactive({
  user: auth.user._id,
  openAmount: '',
  moves: []
})

const refs = reactive({
  selectProvider: null,
  inputDteNumber: null,
  inputAmount: null,
  btnCreateMove: null,
  btnOpenCashMoves: null
})

onMounted(async () => {
  await cashMoves.getLast()
  if (cashMoves.doc && !cashMoves.isOpen) {
    cashMove.openAmount = cashMoves.doc.openAmount
  }
})

const openCashMoves = async () => {
  cashMove.openAmount = move.amount
  await cashMoves.create(cashMove)
  router.go(-1)
}

const createMove = async () => {
  if (provider.value) {
    move.description = `Pago ${provider.value} (${dteNumber.value})`
  }

  await cashMoves.addItem('moves', move, 'Moviemiento ingresado con éxito')
  router.go(-1)
}

const focus = async name => {
  await nextTick()
  refs[name].focus()
}
</script>
<template>
  <Dialog
    v-model="dialog"
    title="Inicio de Caja"
    @confirm="openCashMoves"
    :loading="cashMoves.saving"
  >
    {{
      `¿Estas seguro de Inicia Caja como ${auth.user.name} ${
        auth.user.lastName
      } por ${formatter.currency(move.amount)}?`
    }}
  </Dialog>

  <PageResponsive>
    <Form @submit="createMove" class="q-pa-lg">
      <div class="row items-center justify-between q-pb-lg">
        <div class="row">
          <ButtonBack />
          <div v-if="cashMoves.isOpen" class="text-h5">
            Ingresar Nuevo Movimiento
          </div>
          <div v-else class="text-h5">Inicio de Caja</div>
        </div>
      </div>

      <div class="fit row justify-center q-px-lg q-py-xl">
        <div class="col-8 row q-gutter-y-md justify-center">
          <div v-if="cashMoves.isOpen" class="fit column">
            <Select
              label="Tipo de Movimiento"
              required
              v-model="move.moveType"
              :options="moveTypes"
              option-label="moveType"
              option-value="moveType"
              emit-value
              @update:modelValue="
                move.moveType == 'Pago a Proveedor'
                  ? focus('selectProvider')
                  : focus('inputDescription')
              "
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    {{ scope.opt.moveType }}
                  </q-item-section>
                </q-item>
              </template>
            </Select>

            <div v-if="move.moveType == 'Pago a Proveedor'">
              <SelectInputFetch
                label="Proveedor"
                fetchAll
                :storeId="providers.$id"
                v-model="provider"
                @update:modelValue="focus('inputDteNumber')"
                field="alias"
                actives
                :ref="el => (refs.selectProvider = el)"
                required
              />

              <Input
                label="Folio Factura"
                v-model="dteNumber"
                class="full-width"
                required
                @keyup.enter="dteNumber && focus('inputAmount')"
                :ref="el => (refs.inputDteNumber = el)"
              />
            </div>

            <Input
              v-else
              label="Descripción"
              v-model="move.description"
              @keyup.enter="focus('inputAmount')"
              class="full-width"
              required
              :ref="el => (refs.inputDescription = el)"
            />
            <Input
              label="Monto"
              v-model="move.amount"
              format="currency"
              @keyup.enter="refs.btnCreateMove.$el.focus()"
              class="full-width q-mb-lg"
              :ref="el => (refs.inputAmount = el)"
            />

            <q-btn
              label="INGRESAR MOVIMIENTO"
              color="positive"
              :disable="
                !move.moveType ||
                move.amount <= 0 ||
                (!move.description && (!provider || !dteNumber))
              "
              type="submit"
              :loading="cashMoves.saving"
              :ref="el => (refs.btnCreateMove = el)"
            />
          </div>

          <div v-else class="column" style="width: 300px">
            <Input
              label="Monto"
              v-model="move.amount"
              format="currency"
              class="full-width"
              @keyup.enter="refs.btnOpenCashMoves.$el.focus()"
              required
              :ref="el => (refs.inputAmount = el)"
            />
            <q-btn
              color="positive"
              label="INICIO DE CAJA"
              :disable="move.amount <= 0"
              @click="dialog = true"
              class="q-mt-md"
              :ref="el => (refs.btnOpenCashMoves = el)"
            />
          </div>
        </div>
      </div>
    </Form>
  </PageResponsive>
</template>
