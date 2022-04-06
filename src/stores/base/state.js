import { LocalStorage } from 'quasar'

export const baseState = () => ({
  docs: [],
  doc: {},
  options: [],
  count: 0,
  loading: false,
  saving: false,
  deleting: false
})

export const tableState = (
  storeId,
  { visibles, forceSelect, containsFields, equalFilter, dateFilter }
) => {
  const table = LocalStorage.getItem(`${storeId}/table`) || {
    input: '',
    visibles,
    forceSelect,
    pagination: {
      sortBy: null,
      descending: false,
      page: 1,
      rowsPerPage: 10
    },
    containsFields,
    equalFilter,
    dateFilter,
    actives: true
  }
  table.input = ''
  table.pagination.page = 1
  table.equalFilter = equalFilter

  return table
}
