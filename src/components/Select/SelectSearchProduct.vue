<script setup>
import { ref, inject, nextTick } from 'vue'
import { useProducts } from 'stores/products'
import formatter from 'tools/formatter'
import notify from 'tools/notify'

const emit = defineEmits(['next'])

const inputValue = ref('')
const options = ref([])
const pos = inject('pos')
const products = useProducts()
const selectRef = ref('')
const disable = ref(false)

const filterFn = async (value, update) => {
  let isNumber = Number.isInteger(parseInt(value))

  if (isNumber && value.length >= 6) {
    update()
    return
  }

  if (value.length > 2) {
    await products.getQueryDocs({
      query: {
        contains: {
          fields: ['code', 'name'],
          value
        },
        equal: { active: true }
      },
      select: ['code', 'name', 'stock', 'price', 'exempt', 'cost', 'batPrice'],
      sort: { totalSales: -1 }
    })

    options.value = products.docs
  } else {
    options.value = []
  }
  update()
}

const addItem = (item, quantity) => {
  pos.addItem(
    {
      code: item.code,
      product: item._id,
      name: item.name,
      price: item.price,
      exempt: item.exempt,
      cost: item.cost,
      batPrice: item.batPrice
    },
    quantity
  )
  clear()
}

const addNoCodeItem = item => {
  let code = Date.now()
  addItem(
    {
      code,
      product: null,
      name: 'PRODUCTO SIN CODIGO',
      price: parseInt(inputValue.value),
      exempt: false,
      batPrice: 0,
      cost: Math.round(parseInt(inputValue.value) / 1.4)
    },
    1
  )
  clear()
}

const onEnter = async () => {
  if (inputValue.value == '') {
    emit('next')
    return
  }
  let isNumber = Number.isInteger(parseInt(inputValue.value))

  if (isNumber) {
    let quantity = 1
    let code = inputValue.value

    disable.value = true

    if (
      inputValue.value.length == 13 &&
      inputValue.value.slice(0, 3) == '123'
    ) {
      code = inputValue.value.slice(0, 7)
      quantity = parseInt(inputValue.value.slice(7, 12))
      if (quantity > 10) {
        quantity = quantity / 1000
      }
    }

    await products.findDoc({ code })
    let selectedItem = products.doc

    if (selectedItem) {
      addItem(selectedItem, quantity)
    } else if (code.length < 6) {
      addNoCodeItem()
    } else {
      notify.negative('Código sin resultados')
    }
  } else {
    let selectedItem = options.value.find(item => item.name == inputValue.value)

    if (selectedItem) {
      addItem(selectedItem, 1)
    }
  }
  disable.value = false
  await nextTick()
  selectRef.value.focus()
}

const clear = () => {
  inputValue.value = ''
  selectRef.value.updateInputValue('')
  selectRef.value.focus()
}
</script>

<template>
  <q-select
    v-bind="$attrs"
    outlined
    behavior="menu"
    ref="selectRef"
    label="Buscar producto por código o nombre"
    :model-value="inputValue"
    @input-value="inputValue = $event"
    :options="options"
    use-input
    hide-selected
    fill-input
    input-debounce="300"
    option-value="name"
    option-label="name"
    emit-value
    @filter="filterFn"
    @keyup.enter="onEnter"
    :disable="disable"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" @click="addItem(scope.opt, 1)">
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
          <q-item-label caption
            >Código: {{ scope.opt.code }} Stock: {{ scope.opt.stock }} Precio:
            {{ formatter.currency(scope.opt.price) }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:prepend>
      <q-icon name="search" @click.stop />
    </template>
    <template v-slot:append>
      <q-icon
        v-if="inputValue"
        name="cancel"
        @click.stop="clear"
        class="cursor-pointer"
      />
    </template>
  </q-select>
</template>
