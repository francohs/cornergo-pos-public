import { Notify } from 'quasar'

const notify = {
  positive: message => {
    Notify.create({ type: 'positive', message })
  },
  negative: message => {
    Notify.create({ type: 'negative', message })
  }
}

export default notify
