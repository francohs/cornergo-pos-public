<template>
  <PageResponsive :loading="items.loading">
    <div class="q-pa-lg q-px-xs-md q-px-md-xl">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5">Items</div>

        <ButtonLinkCreate :store="items.$id" />
      </div>

      <q-list v-if="items.docs.length > 0" bordered separator>
        <q-item
          clickable
          v-ripple
          v-for="item of items.docs"
          :key="item._id"
          class="q-py-md"
          :to="{ name: 'items/:id', params: { id: item._id } }"
        >
          <q-item-section avatar>
            <q-avatar
              rounded
              color="primary"
              text-color="white"
              icon="person"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div
        v-if="items.docs.length == 0"
        class="q-mt-xl text-center text-grey-7"
      >
        Aún no tienes items
      </div>
    </div>
  </PageResponsive>
</template>

<script setup>
import { useItems } from 'stores/items'
import { onMounted, provide } from 'vue'

const items = useItems()
provide(items.$id, items)

onMounted(async () => await items.getDocs())
</script>
