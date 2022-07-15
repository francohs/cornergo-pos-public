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
  })
  window.updater.receive('update-not-available', info => {
    console.log('[update-not-available]', info)
    checking.value = false
  })
  window.updater.receive('error', err => {
    console.log('[error]', err)
  })
  window.updater.receive('download-progress', info => {
    console.log('[download-progress]', info)
    progress.value = info.percent / 100
  })
  window.updater.receive('update_available', info => {
    console.log('[update_available]', info)
    version.value = info.version
  })
  window.updater.receive('update_downloaded', () => {
    console.log('[update_downloaded]')
    checking.value = false
    dialog.value = true
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
        <q-btn
          flat
          icon="menu"
          aria-label="Menu"
          @click="emits('drawerOpen')"
        />
        <q-btn flat dense style="font-size: 18px" label="CORNERGO POS"
          ><q-menu :offset="[0, 7]">
            <q-list style="width: 240px">
              <q-item clickable @click="checkUpdates">
                <q-item-section avatar>
                  <q-icon name="update" />
                </q-item-section>

                <q-item-section>{{
                  progress == 1
                    ? `Actualizar a v${version}`
                    : 'Buscar actualización'
                }}</q-item-section>
              </q-item>
              <q-linear-progress
                v-show="checking || progress > 0"
                :indeterminate="checking && (progress == 0 || progress == 1)"
                :value="progress"
              />
            </q-list> </q-menu
        ></q-btn>
      </div>

      <q-btn
        dense
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
