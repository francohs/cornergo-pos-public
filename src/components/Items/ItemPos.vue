<script setup>
import { inject, ref } from 'vue'
import formatter from 'tools/formatter'

const props = defineProps({
  item: Object,
  readonly: Boolean
})

const pos = props.readonly ? null : inject('pos')
const deleting = ref(false)

async function removeItem(item) {
  deleting.value = true
  await pos.userRemoveItems([item])
  pos.removeItem(item)
  deleting.value = false
}
</script>

<template>
  <q-item class="q-px-none">
    <div class="full-width row items-center q-py-sm">
      <div v-if="!readonly" class="q-mr-sm">
        <q-btn
          dense
          flat
          icon="clear"
          color="grey-7"
          @click="removeItem(item)"
          :loading="deleting"
        />
      </div>
      <div class="row justify-start q-mr-md">
        <div v-if="readonly" class="text-h5 q-mx-md">
          {{ item.quantity }}
        </div>
        <InputQuantity
          v-else
          :modelValue="item.quantity"
          @add="pos.incrementQuantity(item)"
          @subtract="pos.decrementQuantity(item)"
        />
      </div>
      <div class="col q-pr-md text-left" style="font-size: 18px">
        <q-item-label caption v-if="item.name != 'PRODUCTO SIN CODIGO'"
          >Código: {{ item.code }}</q-item-label
        >
        <q-item-label>
          {{ item.name }}
        </q-item-label>
      </div>
      <div class="" style="font-size: 18px; width: 100px">
        <q-item-label caption>Precio</q-item-label>
        <q-item-label>
          {{ formatter.currency(item.price) }}
        </q-item-label>
      </div>
      <div class="text-right q-mr-md" style="font-size: 20px; width: 100px">
        <q-item-label caption>Subtotal</q-item-label>
        <q-item-label>
          {{ formatter.currency(parseInt(item.price * item.quantity)) }}
        </q-item-label>
      </div>
    </div>
  </q-item>
</template>
