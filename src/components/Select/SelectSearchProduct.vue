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
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" @click="addItem(scope.opt)">
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

<script setup>
import { ref, inject } from 'vue'
import { api } from 'boot/axios'
import formatter from 'tools/formatter'
import notify from 'tools/notify'

const emit = defineEmits(['next'])

const inputValue = ref('')
const options = ref([])
const pos = inject('pos')
const selectRef = ref('')

const filterFn = async (value, update) => {
  if (value.length > 2) {
    const { data } = await api.post('products/query', {
      query: {
        contains: {
          fields: ['code', 'name'],
          value
        },
        equal: { active: true }
      },
      select: ['code', 'name', 'stock', 'price', 'isExempt'],
      sort: { name: -1 }
    })

    options.value = data.docs
  } else {
    options.value = []
  }
  update()
}

const addItem = product => {
  pos.addItem(product)
  clear()
}

const onEnter = () => {
  if (inputValue.value == '') {
    emit('next')
    return
  }

  let isNumber = Number.isInteger(parseInt(inputValue.value))

  if (isNumber) {
    let selectedItem = options.value.find(item => item.code == inputValue.value)

    if (selectedItem) {
      addItem(selectedItem)
    } else if (inputValue.value.length < 6) {
      let code = Date.now()
      addItem({
        _id: code,
        code,
        name: 'PRODUCTO SIN CODIGO',
        price: parseInt(inputValue.value),
        quantity: 1
      })
    } else {
      notify.negative('Código sin resultados')
    }
  } else {
    let selectedItem = options.value.find(item => item.name == inputValue.value)

    if (selectedItem) {
      addItem(selectedItem)
    }
  }
}

const clear = () => {
  inputValue.value = ''
  selectRef.value.updateInputValue('')
  selectRef.value.focus()
}
</script>
