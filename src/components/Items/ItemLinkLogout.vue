<template>
  <q-item clickable @click="logout">
    <q-item-section avatar>
      <q-icon name="logout" />
    </q-item-section>

    <q-item-section>Salir</q-item-section>
  </q-item>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from 'stores/auth'

const auth = useAuth()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.push({ name: 'login' })
}
</script>
