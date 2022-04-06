<template>
  <div class="q-pa-md">
    <Table
      v-bind="$attrs"
      :rows="filteredRows"
      :columns="columns"
      :visible-columns="table.visibles"
      v-model:pagination="table.pagination"
      :loading="store.loading"
    >
      <template v-slot:top>
        <div class="full-width row items-center q-gutter-x-sm">
          <q-icon :name="titleIcon" size="sm" class="q-mx-none" />
          <div class="text-h6 q-mr-md">{{ title }}</div>

          <InputTable
            v-model="table.input"
            :placeholder="inputPlaceholder"
            style="width: 268px"
            :onlynumbers="inputOnlynumbers"
          />

          <slot name="extracontrols" />
          <q-space />

          <SelectTableVisibles
            v-model="table.visibles"
            :columns="columns"
            @update:modelValue="saveTable"
          />

          <SelectTableSort
            v-model="table.pagination"
            :columns="columns"
            :visibles="table.visibles"
            @update:modelValue="saveTable"
          />

          <ButtonLinkCreate :storeId="store.$id" v-if="createBtn" />
        </div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <slot :props="props">
            <q-td v-for="column in columns" :key="column.name" :props="props">
              {{ props.row[column.name] }}
            </q-td>
          </slot>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-8 q-gutter-sm">
          <span>
            {{ store.loading ? 'Cagando datos...' : noDataText }}
          </span>
        </div>
      </template>

      <template v-slot:bottom>
        <div class="full-width row justify-between items-center">
          <div class="row items-center">
            {{ filteredRows.length }} Resultados

            <ToggleActives
              v-if="activeToggle"
              v-model="table.actives"
              @update:modelValue="saveTable"
            />
          </div>

          <div class="row items-center">
            <SelectRowsPerPage
              v-model="table.pagination.rowsPerPage"
              @update:modelValue="saveTable"
            />

            <PaginationTable
              v-model:pagination="table.pagination"
              :count="store.countDocs"
            />
          </div>
        </div>
      </template>
    </Table>
  </div>
</template>

<script setup>
import { LocalStorage } from 'quasar'
import { inject, computed, onMounted } from 'vue'

const props = defineProps({
  storeId: String,
  tableName: String,
  columns: Array,
  title: String,
  titleIcon: String,
  activeToggle: Boolean,
  inputPlaceholder: String,
  inputOnlynumbers: Boolean,
  forceSort: Object,
  createBtn: Boolean,
  noDataText: String
})

const store = inject(props.storeId)
const table = store[props.tableName]

// onMounted(async () => {
//   table.input = ''
//   table.pagination.page = 1
//   store.clearDocs()
// })

const filteredRows = computed(() => {
  let filteredRows = store.docs

  if (table.actives) {
    filteredRows = store.docs.filter(row => row.active)
  }

  if (table.input) {
    filteredRows = store.docs.filter(row => {
      for (let field of table.containsFields) {
        let rowValue = row[field]
        if (
          rowValue &&
          rowValue.toUpperCase().includes(table.input.toUpperCase())
        ) {
          return true
        }
      }
      return false
    })
  }

  return filteredRows
})

const saveTable = () => {
  LocalStorage.set(props.tableName, table)
}
</script>
