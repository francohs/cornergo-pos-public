import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'
import { tableState } from './base/state'

export const useProducts = defineStore({
  id: 'products',

  state: () => ({
    ...baseState(),
    table: tableState('products', {
      visibles: ['code', 'name', 'stock', 'price', 'active'],
      forceSelect: [],
      containsFields: ['code', 'name'],
      equalFilter: {
        provider: null
      },
      dateFilter: {}
    })
  }),

  getters: {
    ...baseGetters()
  },

  actions: {
    ...baseActions()
  }
})
