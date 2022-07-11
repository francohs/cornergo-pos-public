<script setup>
import { LocalStorage } from 'quasar'
import { useAuth } from 'stores/auth'
import { ref } from 'vue'

const dialog = ref(false)
const version = ref('')

const auth = useAuth()

let localDrawerOpen = LocalStorage.getItem('drawer')
localDrawerOpen = localDrawerOpen === null ? true : localDrawerOpen
const drawerOpen = ref(localDrawerOpen)

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
  LocalStorage.set('drawer', drawerOpen.value)
}

const restartAndUpdate = () => {
  if (window.updater) {
    window.updater.send('restart-app')
  }
}
if (window.updater) {
  window.updater.receive('checking-for-update', () => {
    console.log('[checking-for-update]')
  })
  window.updater.receive('update-not-available', info => {
    console.log('[update-not-available]', info)
  })
  window.updater.receive('error', err => {
    console.log('[error]', err)
  })
  window.updater.receive('download-progress', progressObj => {
    console.log('[download-progress]', progressObj)
  })
  window.updater.receive('update_available', info => {
    console.log('[update_available]', info)
    version.value = info.version
  })
  window.updater.receive('update_downloaded', () => {
    console.log('[update_downloaded]')
    dialog.value = true
  })
}
</script>

<template>
  <q-layout view="hHh Lpr lff">
    <Navbar @drawer-open="toggleDrawer" />

    <Drawer v-model="drawerOpen" v-if="auth.isLogged" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

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
