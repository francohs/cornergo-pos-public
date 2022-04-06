import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { api } from 'src/boot/axios'

export const usePos = defineStore({
  id: 'pos',

  state: () => ({
    dteType: 'Boleta',
    payType: 'Efectivo',
    client: null,
    items: [],
    savedItems: LocalStorage.getItem('savedItems') || [],
    pays: []
  }),

  getters: {
    total() {
      return this.items.reduce(
        (prev, curr) => prev + curr.price * curr.quantity,
        0
      )
    },
    totalPay() {
      return this.pays.reduce((prev, curr) => prev + curr.payAmount, 0)
    },
    backPay() {
      let backPay = this.totalPay - this.total
      return backPay < 0 ? 0 : backPay
    },
    isTotalReach() {
      return this.totalPay >= this.total
    }
  },

  actions: {
    addItem(product) {
      const index = this.items.findIndex(item => item._id == product._id)
      if (index > -1) {
        this.items[index].quantity++
      } else {
        this.items = [
          ...this.items,
          {
            ...product,
            quantity: 1
          }
        ]
      }
    },
    removeItem(item) {
      this.items = this.items.filter(t => t._id !== item._id)
    },
    saveItems() {
      LocalStorage.set('savedItems', this.items)
      this.savedItems = this.items
      this.resetAll()
    },
    loadItems() {
      this.items = this.savedItems
      this.savedItems = []
      LocalStorage.remove('savedItems')
    },
    incrementQuantity(item) {
      const index = this.items.findIndex(t => t._id == item._id)

      this.items[index].quantity++
    },
    decrementQuantity(item) {
      const index = this.items.findIndex(t => t._id == item._id)

      this.items[index].quantity--

      if (this.items[index].quantity < 1) {
        this.items = this.items.filter(t => t._id !== item._id)
      }
    },

    addPay(payAmount) {
      const index = this.pays.findIndex(pay => pay.payType == this.payType)

      if (index > -1) {
        this.pays[index].payAmount += payAmount
      } else {
        this.pays = [...this.pays, { payType: this.payType, payAmount }]
      }

      if (this.payType != 'Crédito Cliente') {
        this.payType = 'Efectivo'
      }
    },

    removePay(pay) {
      this.pays = this.pays.filter(target => target.payType !== pay.payType)
      this.payType = 'Efectivo'
      if (this.pays.length == 0) this.client = null
    },

    setPayType(payType) {
      if (payType == 'Crédito Cliente') {
        this.pays = []
      }
      this.payType = payType
    },

    resetAll() {
      this.dteType = 'Boleta'
      this.payType = 'Efectivo'
      this.client = null
      this.items = []
      this.pays = []
    },

    async createDte() {
      try {
        console.log({
          dteType: this.dteType,
          payType: this.payType,
          totalPay: this.totalPay,
          client: this.client,
          items: this.items,
          savedItems: this.savedItems,
          total: this.total,
          pays: this.pays
        })
        console.log({ backPay: this.backPay })
        console.log('print dte!')
        this.resetAll()
        // const response = await api.post(this.$id, { doc })

        // commit('createDoc', { doc: response.data.doc })
      } catch (error) {
        throw error
      }
    }
  }
})
