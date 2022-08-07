<script setup>
import { useAuth } from 'stores/auth'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const auth = useAuth()
const quasar = useQuasar()

const emits = defineEmits(['drawerOpen'])

const checking = ref(false)
const progress = ref(0)
const version = ref('')
const message = ref('Buscar actualización')
const dialog = ref(false)

const isMovile = quasar.screen.width < 480

const checkUpdates = () => {
  if (progress.value == 1) {
    restartAndUpdate()
    return
  }

  checking.value = true

  if (window.updater) {
    window.updater.send('check-for-updates')
  }
}

if (window.updater) {
  window.updater.receive('checking-for-update', () => {
    console.log('[checking-for-update]')
    message.value = 'Buscando actualizacion...'
  })
  window.updater.receive('update-not-available', info => {
    console.log('[update-not-available]', info)
    checking.value = false
    message.value = 'Tienes la última versión'
    setTimeout(() => (message.value = 'Buscar actualización'), 5000)
  })
  window.updater.receive('error', err => {
    console.log('[error]', err)
    message.value = 'Error al buscar'
    setTimeout(() => (message.value = 'Buscar actualización'), 5000)
  })
  window.updater.receive('download-progress', info => {
    console.log('[download-progress]', info)
    progress.value = Math.round(info.percent / 100)
    message.value = `Descargando ${Math.round(info.percent)}%`
  })
  window.updater.receive('update_available', info => {
    console.log('[update_available]', info)
    version.value = info.version
    message.value = `Nueva versión v${version.value}`
  })
  window.updater.receive('update_downloaded', () => {
    console.log('[update_downloaded]')
    checking.value = false
    dialog.value = true
    message.value = `Nueva versión v${version.value}`
  })
}

const restartAndUpdate = () => {
  if (window.updater) {
    window.updater.send('restart-app')
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
