import { api } from 'boot/axios'
import notify from 'tools/notify'

export const baseActions = () => {
  return {
    async getQueryDocs(request) {
      try {
        this.loading = true
        const { data } = await api.post(`${this.$id}/query`, request)

        this.docs = data.docs

        this.count = data.count
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async getQueryOptions(request) {
      try {
        this.loading = true
        const { data } = await api.post(`${this.$id}/query`, request)

        this.options = data.docs
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async getDocs() {
      try {
        this.loading = true
        const { data } = await api.get(this.$id)
        this.docs = data.docs
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async getDoc(id) {
      try {
        this.loading = true
        const { data } = await api.get(`${this.$id}/${id}`)
        this.doc = data.doc
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async findDoc(equal) {
      try {
        this.loading = true
        const { data } = await api.post(`${this.$id}/find`, equal)
        this.doc = data.doc
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async create(doc, message = 'Datos creados con éxito') {
      try {
        this.saving = true
        const { data } = await api.post(this.$id, { doc })
        this.doc = data.doc
        this.docs.push(data.doc)
        if (message) notify.positive(message)
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },
    async update(id, mod, message = 'Datos modificados con éxito') {
      try {
        this.saving = true

        const { data } = await api.patch(`${this.$id}/${id}`, {
          mod
        })

        this.doc = data.doc
        const index = this.docs.findIndex(doc => doc._id === id)
        if (index > -1) {
          this.docs[index] = data.doc
        }

        if (message) notify.positive(message)
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },
    async replace(id, doc, message = 'Datos modificados con éxito') {
      try {
        this.saving = true

        const { data } = await api.put(`${this.$id}/${id}`, {
          doc
        })

        this.doc = data.doc
        const index = this.docs.findIndex(doc => doc._id === id)
        if (index > -1) {
          this.docs[index] = data.doc
        }

        if (message) notify.positive(message)
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },

    async addItem(itemsName, item, message = 'Item agregado con éxito') {
      try {
        this.saving = true

        const { data } = await api.patch(`${this.$id}/${this.doc._id}/add`, {
          itemsName,
          item
        })

        this.doc = data.doc
        this.insertDoc(this.doc)

        if (message) notify.positive(message)
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },

    async removeItem(itemsName, itemId, message = 'Item eliminado con éxito') {
      try {
        this.saving = true

        const { data } = await api.patch(`${this.$id}/${this.doc._id}/remove`, {
          itemsName,
          itemId
        })

        this.doc = data.doc
        console.log(this.doc)
        this.removeDoc(this.doc._id)

        if (message) notify.positive(message)
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },

    async delete(id, message = 'Datos eliminados con éxito') {
      try {
        this.deleting = true
        await api.delete(`${this.$id}/${id}`)
        this.doc = {}
        this.docs = this.docs.filter(doc => doc._id != id)
        if (message) notify.positive(message)
      } catch (error) {
        throw error
      } finally {
        this.deleting = false
      }
    },
    insertDoc(doc) {
      const index = this.docs.findIndex(d => d._id === doc._id)
      if (index > -1) {
        this.docs[index] = doc
      }
    },
    removeDoc(id) {
      this.docs = this.docs.filter(d => d._id != id)
    },
    clearDoc() {
      this.doc = {}
    },
    clearDocs() {
      this.docs = []
    }
  }
}

// reques arg explanation
// await store.getQueryDocs({
//   query: {
//     contains: {
//       fields: Array,
//       value: Any
//     },
//     equal: Object,
//     date: String
//   },
//   select: Array,
//   sort: Object,
//   pagination: {
//     page: Number,
//     rowsPerPage: Number
//   }
// })
