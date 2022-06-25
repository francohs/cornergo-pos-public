import { Notify } from 'quasar'

const notify = {
  info: message => {
    Notify.create({
      color: 'primary',
      message
    })
  },
  positive: message => {
    Notify.create({ type: 'positive', message })
  },
  warning: message => {
    Notify.create({ type: 'warning', message })
  },
  negative: message => {
    Notify.create({ type: 'negative', message })
  }
}

export default notify
