<template>
  <q-td :key="field" :props="cell">
    <q-btn v-if="url || name" flat size="md" icon="launch" @click="goto" />
    <span v-else class="text-grey-8">{{ noLink }}</span>
  </q-td>
</template>

<script setup>
import { openURL } from 'quasar'
import { useRouter } from 'vue-router'

const props = defineProps(['cell', 'field', 'url', 'params', 'name', 'noLink'])

const router = useRouter()

const goto = () => {
  if (props.url) {
    openURL(props.url)
  } else {
    console.log({
      name: props.name,
      params: { id: props.cell.row._id }
    })
    // router.push({
    //   name: props.name,
    //   params: { id: props.cell.row._id }
    // })
    router.push(`/${props.name}/${props.cell.row._id}`)
  }
}
</script>
