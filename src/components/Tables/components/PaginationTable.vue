<template>
  <div>
    <q-btn
      icon="chevron_left"
      color="grey-8"
      round
      dense
      flat
      :disable="pagination.page == 1"
      @click="
        $emit('update:pagination', {
          ...pagination,
          page: pagination.page - 1
        })
      "
    />

    {{ pagination.page }} / {{ pages }}

    <q-btn
      icon="chevron_right"
      color="grey-8"
      round
      dense
      flat
      :disable="pagination.page == pages"
      @click="
        $emit('update:pagination', {
          ...pagination,
          page: pagination.page + 1
        })
      "
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['pagination', 'count'])

const pages = computed(() =>
  Math.ceil(props.count / props.pagination.rowsPerPage)
)
</script>
