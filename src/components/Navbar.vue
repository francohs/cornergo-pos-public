<script setup>
import { useAuth } from 'stores/auth'
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const auth = useAuth()
const quasar = useQuasar()

const loading = ref(false)

const isMovile = quasar.screen.width < 480

const checkUpdates = () => {
  loading.value = true

  if (window.updater) {
    window.updater.send('check-for-updates')

    window.updater.receive('update-not-available', info => {
      console.log('[update-not-available]', info)
      loading.value = false
    })

    window.updater.receive('update_downloaded', () => {
      console.log('[update_downloaded]')
      loading.value = false
    })
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
          @click="$emit('drawer-open')"
        />
        <q-btn flat dense style="font-size: 18px" label="CORNERGO POS"
          ><q-menu :offset="[0, 7]">
            <q-list style="width: 240px">
              <q-item clickable @click="checkUpdates">
                <q-item-section avatar>
                  <q-icon name="update" :loading="loading" />
                </q-item-section>

                <q-item-section>Buscar actualización</q-item-section>
              </q-item>
              <q-linear-progress indeterminate v-show="loading" />
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
</template>
