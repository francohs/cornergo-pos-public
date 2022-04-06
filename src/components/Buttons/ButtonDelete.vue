<template>
  <div>
    <q-btn v-bind="$attrs" icon="delete" @click="dialog = true" color="grey">
      <q-tooltip>Eliminar</q-tooltip>
    </q-btn>

    <Dialog
      v-model="dialog"
      title="Eliminar Recurso"
      confirmColor="negative"
      @confirm="deleteDoc"
      :loading="store.deleting"
    >
      <div class="text-center q-pb-md">¿Desea eliminar el recurso?</div>
    </Dialog>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['storeId', 'id'])

const router = useRouter()
const store = inject(props.storeId)
const dialog = ref(false)

async function deleteDoc() {
  await store.delete(props.id)
  router.go(-1)
}
</script>
