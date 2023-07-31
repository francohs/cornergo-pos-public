<script setup>
import { onMounted, ref } from 'vue'

const checking = ref(false)
const progress = ref(0)
const version = ref('')
const message = ref('Buscar actualización')
const dialog = ref(false)

onMounted(() => {
  if (window.main) {
    window.main.on('checking-for-update', () => {
      message.value = 'Buscando actualizacion...'
    })
    window.main.on('update-not-available', info => {
      checking.value = false
      message.value = 'Tienes la última versión'
      setTimeout(() => (message.value = 'Buscar actualización'), 5000)
    })
    window.main.on('updater-error', err => {
      console.log('[updater error]', err)
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
})

function checkUpdates() {
  if (progress.value == 1) {
    restartAndUpdate()
    return
  }

  checking.value = true

  if (window.main) {
    window.main.send('check-for-updates')
  }
}

function restartAndUpdate() {
  if (window.main) {
    window.main.send('restart-app')
  }
}
</script>

<template>
  <q-btn flat dense class="q-mx-lg" style="font-size: 18px" label="CORNERGO POS"
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
