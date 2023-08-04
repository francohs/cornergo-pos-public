<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from 'stores/auth'
import { usePos } from 'stores/pos'

const auth = useAuth()
const pos = usePos()
const quasar = useQuasar()

const isMovile = quasar.screen.width < 480

onMounted(() => {
  if (window.main) {
    window.main.send('printer-status')

    window.main.on('printer-status', status => {
      pos.setPrinterStatus(status)
    })

    window.main.on('usb-attach', device => {
      console.log({device})
    })

    window.main.on('usb-detach', device => {
      console.log({device})
    })
  }
})
</script>

<template>
  <q-header class="bg-blue-grey-10">
    <q-toolbar class="justify-between q-pl-none q-pr-lg">
      <div class="row items-center">
        <Updater />

        <ItemLink page="pos" icon="point_of_sale" label="POS" />
        <ItemLink page="cashmoves" icon="sync_alt" label="ARQUEO" />
        <ItemLink page="emitteddtes" icon="receipt_long" label="VENTAS" />
        <ItemLink page="clients" icon="groups" label="CLIENTES" />
        <!-- <ItemLink page="transbank" icon="point_of_sale" label="TRANSBANK" /> -->
      </div>

      <div class="row items-center">
        <q-icon
          :name="pos.printerStatus ? 'print' : 'print_disabled'"
          size="sm"
          :color="pos.printerStatus ? 'green-13' : 'red-13'"
          class="q-mr-md"
        >
          <q-tooltip>{{
            pos.printerStatus ? 'Impresora Conectada' : 'Impresora Desconectada'
          }}</q-tooltip>
        </q-icon>

        <Transbank />

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
</template>
