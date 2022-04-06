<template>
  <q-layout view="hHh Lpr lff">
    <Navbar @drawer-open="toggleDrawer" />

    <Drawer v-model="drawerOpen" v-if="auth.isLogged" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { LocalStorage } from 'quasar'
import { useAuth } from 'stores/auth'
import { ref } from 'vue'

const auth = useAuth()

let localDrawerOpen = LocalStorage.getItem('drawer')
localDrawerOpen = localDrawerOpen === null ? true : localDrawerOpen
const drawerOpen = ref(localDrawerOpen)

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
  LocalStorage.set('drawer', drawerOpen.value)
}
</script>
