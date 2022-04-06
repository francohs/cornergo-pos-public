<template>
  <q-table
    v-bind="$attrs"
    :columns="columnsProps"
    row-key="_id"
    separator="cell"
    no-data-label="No se han encontrado datos"
    no-results-label="No se encuentran resultados"
    color="primary"
    :loading="loading"
    :wrap-cells="false"
  >
    <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <slot :props="props">
          <q-td
            v-for="column in columnsProps"
            :key="column.name"
            :props="props"
          >
            {{ props.row[column.name] }}
          </q-td>
        </slot>
      </q-tr>
    </template>

    <template v-slot:no-data>
      <div class="full-width row flex-center text-grey-8 q-gutter-sm">
        <span>
          {{ loading ? loadingText : noDataText }}
        </span>
      </div>
    </template>
  </q-table>
</template>

<script setup>
const props = defineProps({
  columns: Array,
  noDataText: String,
  loading: Boolean,
  loadingText: { type: String, default: 'Cagando datos...' }
})

const columnsProps = props.columns.map(col => {
  col.style = col.size ? `width: ${col.size}px` : 'width: 200px'
  col.align = col.align || 'center'
  col.field = col.field || col.name
  col.sortable = col.sortable == undefined ? false : col.sortable
  return col
})
</script>
