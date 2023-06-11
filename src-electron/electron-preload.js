import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('main', {
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args)
  },
  on: (channel, func) => {
    ipcRenderer.removeAllListeners(channel)
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  }
})
