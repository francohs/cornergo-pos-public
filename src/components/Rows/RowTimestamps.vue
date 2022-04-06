<template>
  <div v-if="doc._id" class="row justify-between">
    <div v-if="formatCreatedAt" class="row items-center">
      <q-icon name="check_circle_outline" size="sm" color="grey-7" />
      <span class="q-ml-sm">{{ formatCreatedAt }}</span>
      <q-tooltip>Creado</q-tooltip>
    </div>
    <div v-if="formatUpdatedAt" class="row items-center q-ml-md">
      <q-icon name="history" size="sm" color="grey-7" />
      <span class="q-ml-sm">{{ formatUpdatedAt }}</span>
      <q-tooltip>Actualizado</q-tooltip>
    </div>
    <div v-if="formatLastSeen" class="row items-center">
      <q-icon name="query_builder" size="sm" color="grey-7" />
      <span class="q-ml-sm">{{ formatLastSeen }}</span>
      <q-tooltip>Visto</q-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps(['doc'])

const formatCreatedAt = ref('')
const formatUpdatedAt = ref('')
const formatLastSeen = ref('')

if (props.doc.createdAt) {
  formatCreatedAt.value = formatter.datetime(props.doc.createdAt)
}
if (props.doc.updatedAt) {
  formatUpdatedAt.value = formatter.datetime(props.doc.updatedAt)
}
if (props.doc.lastSeen) {
  formatLastSeen.value = formatter.datetime(props.doc.lastSeen)
}
</script>
