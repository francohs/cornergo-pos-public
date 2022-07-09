import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'
import { useEmittedDtes } from 'stores/emitteddtes'
import moment from 'moment'

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
      return openIndex > -1 && closeIndex == -1
    },

    validDate() {
      if (this.docs.length > 0) {
        return (
          moment()
            .startOf('day')
            .diff(moment(this.docs[0].createdAt).startOf('day'), 'days') == 0
        )
      }
      return true
    }
  },

  actions: {
    ...baseActions(),

    async closeCashBox(userId) {
      const emittedDtes = useEmittedDtes()

      const cashMove = {
        user: userId,
        moveType: 'Cierre de Caja',
        amount: 0,
        description: 'Cierre de Caja'
      }

      console.log(await emittedDtes.getPayAmounts())

      cashMove.amount = this.docs.reduce((acc, cashMove) => {
        if (
          cashMove.moveType == 'Inicio de Caja' ||
          cashMove.moveType == 'Otro Ingreso'
        ) {
          return acc + parseInt(cashMove.amount)
        } else if (
          cashMove.moveType == 'Pago a Proveedor' ||
          cashMove.moveType == 'Otro Egreso'
        ) {
          return acc - parseInt(cashMove.amount)
        }
      }, 0)

      // await this.create(cashMove, 'Caja cerrada con éxito')
    }
  }
})
