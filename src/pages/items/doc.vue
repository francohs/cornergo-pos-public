<script setup>
import { onMounted, provide, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useItems } from 'stores/items'

const route = useRoute()

const items = useItems()
const id = route.params.id
const item = reactive({})

provide(items.$id, items)

onMounted(async () => {
  try {
    await items.getDoc(id)
    Object.assign(item, items.doc)
  } catch (error) {
    console.error(error)
  }
})
</script>

<template>
  <PageResponsive :loading="items.loading">
    <FormSave :storeId="items.$id" :id="id" :doc="item">
      <div class="row items-center justify-between q-pb-lg">
        <div class="row">
          <ButtonBack />
          <div class="text-h5">Datos Item</div>
        </div>
      </div>

      <Input required v-model="item.name" label="Nombre" class="full-width" />

      <div class="row justify-between q-mt-md">
        <ButtonDelete :storeId="items.$id" :id="id" />

        <div>
          <q-btn
            label="GUARDAR"
            color="positive"
            type="submit"
            :loading="items.saving"
          />
        </div>
      </div>
    </FormSave>
  </PageResponsive>
</template>
