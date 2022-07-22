<template>
  <q-item clickable @click="goto" :active="isActive" active-class="active-link">
    <div class="row items-center">
      <q-icon :name="icon" size="sm" class="q-mr-md" />
      <div>{{ label }}</div>
    </div>
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
  // color: rgb(52, 222, 222);
  color: $green-13;
  // border-left: 5px solid $primary;
  // background: white;
}
</style>
