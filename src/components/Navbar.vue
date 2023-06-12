<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from 'stores/auth'
import { usePos } from 'stores/pos'

const auth = useAuth()
const pos = usePos()
const quasar = useQuasar()

const emits = defineEmits(['drawerOpen'])

const checking = ref(false)
const progress = ref(0)
const version = ref('')
const message = ref('Buscar actualización')
const dialog = ref(false)

const isMovile = quasar.screen.width < 480

onMounted(() => {
  window.main.send('printer-status')
})

const checkUpdates = () => {
  if (progress.value == 1) {
    restartAndUpdate()
    return
  }

  checking.value = true

  if (window.main) {
    window.main.send('check-for-updates')
  }
}

if (window.main) {
  window.main.on('printer-status', status => {
    pos.setPrinterStatus(status)
  })

  window.main.on('checking-for-update', () => {
    message.value = 'Buscando actualizacion...'
  })
  window.main.on('update-not-available', info => {
    checking.value = false
    message.value = 'Tienes la última versión'
    setTimeout(() => (message.value = 'Buscar actualización'), 5000)
  })
  window.main.on('error', err => {
    console.log('[error]', err)
    message.value = 'Error al buscar'
    setTimeout(() => (message.value = 'Buscar actualización'), 5000)
  })
  window.main.on('download-progress', info => {
    progress.value = Math.round(info.percent / 100)
    message.value = `Descargando ${Math.round(info.percent)}%`
  })
  window.main.on('update_available', info => {
    version.value = info.version
    message.value = `Nueva versión v${version.value}`
  })
  window.main.on('update_downloaded', () => {
    checking.value = false
    dialog.value = true
    message.value = `Nueva versión v${version.value}`
  })
}

const restartAndUpdate = () => {
  if (window.main) {
    window.main.send('restart-app')
  }
}
</script>

<template>
  <q-header class="bg-blue-grey-10">
    <q-toolbar class="justify-between q-pl-none q-pr-lg">
      <div class="row items-center">
        <!-- <q-btn
          flat
          icon="menu"
          aria-label="Menu"
          @click="emits('drawerOpen')"
        /> -->
        <q-btn
          flat
          dense
          class="q-mx-lg"
          style="font-size: 18px"
          label="CORNERGO POS"
          ><q-menu :offset="[0, 7]">
            <q-list style="width: 280px">
              <q-item clickable @click="checkUpdates">
                <q-item-section avatar>
                  <q-icon name="update" />
                </q-item-section>

                <q-item-section>{{ message }}</q-item-section>
              </q-item>
              <q-linear-progress
                v-show="checking || progress > 0"
                :indeterminate="checking && (progress == 0 || progress == 1)"
                :value="progress"
              />
            </q-list> </q-menu
        ></q-btn>

        <ItemLink page="pos" icon="point_of_sale" label="POS" />
        <ItemLink page="cashmoves" icon="sync_alt" label="ARQUEO" />
        <ItemLink page="emitteddtes" icon="receipt_long" label="VENTAS" />
        <ItemLink page="clients" icon="groups" label="CLIENTES" />
      </div>

      <div class="row items-center">
        <q-icon
          :name="pos.printerStatus ? 'print' : 'print_disabled'"
          size="sm"
          :color="pos.printerStatus ? 'green-13' : 'red-13'"
        >
          <q-tooltip>{{
            pos.printerStatus ? 'Impresora Conectada' : 'Impresora Desconectada'
          }}</q-tooltip>
        </q-icon>

        <q-btn
          flat
          v-if="auth.isLogged"
          :label="auth.user.username"
          icon="person"
        >
          <q-menu :offset="[0, 7]">
            <q-list style="width: 180px">
              <ItemLink
                page="users/:id"
                :id="auth.user._id"
                icon="person"
                label="Mi Cuenta"
              />
              <q-separator />
              <ItemLinkLogout />
            </q-list>
          </q-menu>
        </q-btn>

        <div v-else class="row no-wrap">
          <q-btn
            flat
            :dense="isMovile"
            :stack="isMovile"
            label="INGRESAR"
            icon="login"
            :to="{ name: 'login' }"
          />
        </div>
      </div>
    </q-toolbar>
  </q-header>
  <Dialog
    v-model="dialog"
    :title="`Nueva actualización v${version}`"
    @confirm="restartAndUpdate"
  >
    <div class="text-center q-pb-md">
      ¿Desea reiniciar amplicación para actualizar?
    </div>
  </Dialog>
</template>
