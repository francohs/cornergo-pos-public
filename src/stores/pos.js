import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const usePos = defineStore({
  id: 'pos',

  state: () => ({
    dteType: 'Boleta Electronica',
    payType: 'Tarjeta de Debito',
    payAmount: '',
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
    roundedTotal() {
      if (this.payType != 'Efectivo') return this.total

      const lastDigit = parseInt(this.total.toString().slice(-1))

      let roundedTotal = this.total
      if (lastDigit >= 0 && lastDigit <= 5) {
        roundedTotal = Math.floor(roundedTotal / 10) * 10
      } else if (lastDigit >= 6 && lastDigit <= 9) {
        roundedTotal = Math.ceil(roundedTotal / 10) * 10
      }

      return roundedTotal
    },
    totalPay() {
      return this.pays.reduce((prev, curr) => prev + curr.amount, 0)
    },
    changeAmount() {
      let changeAmount = this.totalPay - this.roundedTotal
      return changeAmount < 0 ? 0 : changeAmount
    },
    isTotalReach() {
      return this.totalPay >= this.roundedTotal
    }
  },

  actions: {
    addItem(item) {
      const index = this.items.findIndex(i => i.code == item.code)
      if (index > -1) {
        this.items[index].quantity++
      } else {
        this.items = [
          ...this.items,
          {
            ...item,
            quantity: 1
          }
        ]
      }
    },
    removeItem(item) {
      this.items = this.items.filter(i => i.code !== item.code)
    },
    saveItems() {
      LocalStorage.set('savedItems', this.items)
      this.savedItems = this.items
      this.clearAll()
    },
    loadItems() {
      this.items = this.savedItems
      this.savedItems = []
      LocalStorage.remove('savedItems')
    },
    incrementQuantity(item) {
      const index = this.items.findIndex(i => i.code == item.code)

      this.items[index].quantity++
    },
    decrementQuantity(item) {
      const index = this.items.findIndex(i => i.code == item.code)

      this.items[index].quantity--

      if (this.items[index].quantity < 1) {
        this.items = this.items.filter(i => i.code !== item.code)
      }
    },

    addPay(payType, amount) {
      const index = this.pays.findIndex(p => p.payType == payType)
      amount = parseInt(amount)

      if (index > -1) {
        this.pays[index].amount += amount
      } else {
        this.pays = [...this.pays, { payType, amount }]
      }

      // if (payType != 'Credito Cliente') {
      //   this.payType = 'Efectivo'
      // }
      this.payAmount = ''
    },

    removePay(pay) {
      this.pays = this.pays.filter(target => target.payType !== pay.payType)
      this.payType = 'Tarjeta de Debito'
      if (this.pays.length == 0) this.client = null
    },

    clearAll() {
      this.dteType = 'Boleta Electronica'
      this.client = null
      this.payType = 'Tarjeta de Debito'
      this.payAmount = ''
      this.items = []
      this.pays = []
    }
  }
})
