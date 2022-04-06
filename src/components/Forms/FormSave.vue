<template>
  <Form @submit="onSubmit" class="q-pa-lg">
    <slot />
  </Form>
</template>

<script setup>
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['storeId', 'id', 'doc'])

const router = useRouter()
const store = inject(props.storeId)

const onSubmit = async () => {
  if (props.id) {
    await store.update(props.id, props.doc)
  } else {
    await store.create(props.doc)
    router.go(-1)
  }
}
</script>
