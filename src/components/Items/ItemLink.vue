<template>
  <q-item clickable @click="goto" :active="isActive" active-class="active-link">
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps(['page', 'id', 'icon', 'label'])

const router = useRouter()
const route = useRoute()

const isActive = computed(() => {
  const regExOp = /(\w*)\/?(\w*)/.exec(route.name)
  let currentPage = ''

  if (regExOp) {
    currentPage = regExOp[1]
  }

  return currentPage === props.page
})

const goto = () => {
  let params = {}
  if (props.id) params = { id: props.id }
  router.push({ name: props.page, params })
}
</script>

<style lang="scss">
.active-link {
  color: $primary;
  border-left: 5px solid $primary;
  background: white;
}
</style>
