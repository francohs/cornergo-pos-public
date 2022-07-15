import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'
import { useEmittedDtes } from 'stores/emitteddtes'
import { api } from 'boot/axios'
import moment from 'moment'

export const useCashMoves = defineStore({
  id: 'cashMoves',

  state: () => ({
    ...baseState()
  }),

  getters: {
    ...baseGetters(),

    isOpen() {
      return this.doc && !this.doc.closeAmount
    },

    validDate() {
      if (this.docs.length > 0) {
        return (
          moment()
            .startOf('day')
            .diff(moment(this.doc.createdAt).startOf('day'), 'days') == 0
        )
      }
      return true
    }
  },

  actions: {
    ...baseActions(),

    async getLast() {
      try {
        this.loading = true
        const { data } = await api.get(this.$id + '/last')
        this.doc = data.doc
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    async closeCashMoves() {
      const emittedDtes = useEmittedDtes()

      const payAmounts = await emittedDtes.getPayAmounts({
        openDate: this.doc.createdAt,
        closeDate: new Date()
      })

      const cashMove = { ...payAmounts }

      cashMove.totalInputs = this.doc.moves.reduce(
        (acc, curr) =>
          curr.moveType == 'Otro Ingreso' ? acc + parseInt(curr.amount) : acc,
        0
      )

      cashMove.totalOutputs = this.doc.moves.reduce(
        (acc, curr) =>
          curr.moveType == 'Pago a Proveedor' || curr.moveType == 'Otro Egreso'
            ? acc + parseInt(curr.amount)
            : acc,
        0
      )

      cashMove.closeAmount =
        this.doc.openAmount +
        cashMove.cash +
        cashMove.totalInputs -
        cashMove.totalOutputs

      // console.log(cashMove)

      await this.update(this.doc._id, cashMove, 'Caja cerrada con éxito')
    }
  }
})
