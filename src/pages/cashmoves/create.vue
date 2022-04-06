<template>
  <PageResponsive :loading="cashMoves.loading">
    <Form @submit="createCashMove" class="q-pa-lg">
      <div class="row cashMoves-center justify-between q-pb-lg">
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
              v-model="cashMove.moveType"
              :options="moveTypes"
              option-label="moveType"
              option-value="moveType"
              emit-value
              @update:modelValue="
                cashMove.moveType == 'Pago a Proveedor'
                  ? selectProvider.$el.focus()
                  : inputDescription.$el.focus()
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

            <div v-if="cashMove.moveType == 'Pago a Proveedor'">
              <SelectInputFetch
                label="Proveedor"
                fetchAll
                :store="providers.$id"
                v-model="provider"
                @update:modelValue="inputDteNumber.$el.focus()"
                field="alias"
                ref="selectProvider"
                required
              />

              <Input
                label="Folio Factura"
                v-model="dteNumber"
                @keyup.enter="dteNumber && inputAmount.$el.focus()"
                ref="inputDteNumber"
                required
              />
            </div>

            <Input
              label="Descripción"
              ref="inputDescription"
              v-model="cashMove.description"
              @keyup.enter="inputAmount.$el.focus()"
              required
              v-else
            />
            <Input
              label="Monto"
              v-model="cashMove.amount"
              format="currency"
              @keyup.enter="btnCreateMove.$el.focus()"
              ref="inputAmount"
              class="full-width q-mb-lg"
            />

            <q-btn
              label="INGRESAR MOVIMIENTO"
              color="positive"
              ref="btnCreateMove"
              :disable="
                !cashMove.moveType ||
                cashMove.amount <= 0 ||
                (!cashMove.description && (!provider || !dteNumber))
              "
              type="submit"
              :loading="cashMoves.saving"
            />
          </div>

          <div v-else class="column" style="width: 300px">
            <Input
              label="Monto"
              v-model="cashMove.amount"
              format="currency"
              ref="inputAmount"
              @keyup.enter="btnOpenBox.$el.focus()"
              required
            />
            <q-btn
              color="positive"
              label="INICIO DE CAJA"
              :disable="cashMove.amount <= 0"
              @click="openCashBox"
              :loading="cashMoves.saving"
              ref="btnOpenBox"
              class="q-mt-md"
            />
          </div>
        </div>
      </div>
    </Form>
  </PageResponsive>
</template>

<script setup>
import { reactive, provide, ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useCashMoves } from "stores/cashmoves";
import { useProviders } from "stores/providers";
import { useAuth } from "stores/auth";
import formatter from "tools/formatter";

const router = useRouter();
const cashMoves = useCashMoves();
provide(cashMoves.$id, cashMoves);
const providers = useProviders();
provide(providers.$id, providers);
const quasar = useQuasar();

const cashMove = reactive({
  user: null,
  moveType: null,
  amount: "",
  description: "",
});

const moveTypes = ref([
  { icon: "local_shipping", moveType: "Pago a Proveedor" },
  { icon: "arrow_forward", moveType: "Otro Ingreso" },
  { icon: "arrow_back", moveType: "Otro Egreso" },
]);

const auth = useAuth();
const provider = ref(null);
const dteNumber = ref("");

const selectProvider = ref(null);
const inputDteNumber = ref(null);
const inputDescription = ref(null);
const inputAmount = ref(null);
const btnCreateMove = ref(null);
const btnOpenBox = ref(null);

onMounted(async () => {
  await cashMoves.getDocs();
  if (!cashMoves.isOpen) {
    cashMove.amount = cashMoves.docs[0].amount;
  }
});

const createCashMove = async () => {
  if (provider.value) {
    cashMove.description = `Pago ${provider.value} (${dteNumber.value})`;
  }

  cashMove.user = auth.user._id;

  await cashMoves.create(cashMove);
  router.go(-1);
};

const openCashBox = async () => {
  quasar
    .dialog({
      title: "Inicio de Caja",
      message: `¿Estas seguro de Inicia Caja como ${auth.user.name} ${
        auth.user.lastName
      } por ${formatter.currency(cashMove.amount)}?`,
      cancel: true,
    })
    .onOk(async () => {
      cashMove.moveType = "Inicio de Caja";
      cashMove.description = "Inicio de Caja";

      await createCashMove();
    });
};
</script>
