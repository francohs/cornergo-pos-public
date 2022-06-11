<template>
  <PageResponsive>
    <FormSave :storeId="items.$id" :doc="item">
      <div class="row items-center justify-between q-pb-lg">
        <div class="row">
          <ButtonBack />
          <div class="text-h5">Item</div>
        </div>
      </div>

      <Input required v-model="item.name" label="Nombre" />

      <div class="row justify-end q-mt-md">
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

<script setup>
import { reactive, provide } from "vue";
import { useItems } from "stores/items";

const items = useItems();
const item = reactive({});

provide(items.$id, items);
</script>
