import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'

export const useCashMoves = defineStore({
  id: 'cashMoves',

  state: () => ({
    ...baseState()
  }),

  getters: {
    ...baseGetters(),

    isOpen() {
      let openIndex = this.docs.findIndex(
        cashMove => cashMove.moveType == 'Inicio de Caja'
      )
      let closeIndex = this.docs.findIndex(
        cashMove => cashMove.moveType == 'Cierre de Caja'
      )
      return openIndex > -1 && closeIndex < 0
    }
  },

  actions: {
    ...baseActions()
  }
})
