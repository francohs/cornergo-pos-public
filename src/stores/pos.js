import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import notify from 'tools/notify'

export const usePos = defineStore({
  id: 'pos',

  state: () => ({
    dteType: 'Boleta Electronica',
    payType: 'Efectivo',
    payAmount: '',
    client: null,
    items: LocalStorage.getItem('currentItems') || [],
    deleting: false,
    savedItems: LocalStorage.getItem('savedItems') || [],
    pays: [],
    printerStatus: false,
    transbankStatus: false
  }),

  getters: {
    total() {
      return Math.round(
        this.items.reduce((prev, curr) => prev + curr.price * curr.quantity, 0)
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
    addItem(item, quantity) {
      const index = this.items.findIndex(i => i.code == item.code)
      if (index > -1) {
        this.items[index].quantity += quantity
      } else {
        this.items = [
          ...this.items,
          {
            ...item,
            quantity
          }
        ]
      }
      LocalStorage.set('currentItems', this.items)
    },
    async userRemoveItems(items) {
      try {
        this.deleting = true
        await api.post('productsremoves', items)
        notify.positive('Eliminación registrada')
      } catch (error) {
        throw error
      } finally {
        this.deleting = false
      }
    },
    removeItem(item) {
      this.items = this.items.filter(i => i.code !== item.code)
      if (!this.items.length) {
        this.clearAll()
      }
      LocalStorage.set('currentItems', this.items)
    },
    saveItems() {
      LocalStorage.set('savedItems', this.items)
      this.savedItems = this.items
      this.clearAll()
      LocalStorage.set('currentItems', this.items)
    },
    loadItems() {
      if (this.items.length) {
        notify.warning('Para cargar venta guardada, elimine venta actual')
        return
      }
      this.items = this.savedItems
      this.savedItems = []
      LocalStorage.remove('savedItems')
      LocalStorage.set('currentItems', this.items)
    },
    incrementQuantity(item) {
      const index = this.items.findIndex(i => i.code == item.code)

      this.items[index].quantity++
      LocalStorage.set('currentItems', this.items)
    },
    async decrementQuantity(item) {
      const index = this.items.findIndex(i => i.code == item.code)

      this.items[index].quantity--

      await this.userRemoveItems([{ ...item, quantity: 1 }])

      if (this.items[index].quantity < 1) {
        this.removeItem(this.items[index])
      }
      LocalStorage.set('currentItems', this.items)
    },

    addPay(payType, amount) {
      const index = this.pays.findIndex(p => p.payType == payType)
      amount = parseInt(amount)

      if (index > -1) {
        this.pays[index].amount += amount
      } else {
        this.pays = [...this.pays, { payType, amount }]
      }

      this.payAmount = ''
    },

    removePay(pay) {
      this.pays = this.pays.filter(target => target.payType !== pay.payType)
      this.payType = 'Efectivo'
      if (this.pays.length == 0) this.client = null
    },

    clearAll() {
      this.dteType = 'Boleta Electronica'
      this.client = null
      this.payType = 'Efectivo'
      this.payAmount = ''
      this.items = []
      this.pays = []
      LocalStorage.set('currentItems', this.items)
    },

    async userClearAll() {
      await this.userRemoveItems(this.items)
      this.clearAll()
    },

    setPrinterStatus(status) {
      this.printerStatus = status

      status
        ? Notify.create({
            type: 'positive',
            message: 'Impresora: Conectada',
            icon: 'print'
          })
        : Notify.create({
            type: 'negative',
            message: 'Impresora: Desconectada',
            icon: 'print_disabled'
          })
    }


  }
})
