import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import os from 'os'
import printer from './printer.js'
import transbank from './transbank.js'
import { usb } from 'usb'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
} catch (_) {}

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1400,
    height: 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    },
    show: false
  })
  mainWindow.maximize()
  mainWindow.show()

  mainWindow.once('ready-to-show', async () => {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'francohs',
      repo: 'cornergo-pos',
      private: true,
      token: process.env.GH_TOKEN
    })
    autoUpdater.checkForUpdates()
    mainWindow.setTitle(`CornerGO POS v${app.getVersion()}`)
  })

  // mainWindow.removeMenu()//

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  }
  // else {
  //   // mainWindow.webContents.openDevTools()
  //   // we're on production; no access to devtools pls
  //   mainWindow.webContents.on('devtools-opened', () => {
  //     mainWindow.webContents.closeDevTools()
  //   })
  // }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates()
})

autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('checking-for-update')
})
autoUpdater.on('update-available', info => {
  mainWindow.webContents.send('update_available', info)
})
autoUpdater.on('update-not-available', info => {
  mainWindow.webContents.send('update-not-available', info)
})
autoUpdater.on('error', err => {
  mainWindow.webContents.send('error', err)
})
autoUpdater.on('download-progress', info => {
  mainWindow.webContents.send('download-progress', info)
})
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded')
})

ipcMain.on('printer-status', () => {
  mainWindow.webContents.send('printer-status', printer.findPrinter())
})

usb.on('attach', function (device) {
  if (printer.isPrinter(device))
    mainWindow.webContents.send('printer-status', true)
})
usb.on('detach', function (device) {
  if (printer.isPrinter(device))
    mainWindow.webContents.send('printer-status', false)
})

ipcMain.on('print-dte', printer.printDte)
ipcMain.on('cashdraw', printer.cashdraw)
ipcMain.on('print-cash-close', printer.printCashClose)
ipcMain.on('print-payment', printer.printPayment)

ipcMain.on('transbank-init', transbank.init)
ipcMain.on('transbank-keys', transbank.loadKeys)
ipcMain.on('transbank-sale', transbank.sale)
ipcMain.on('transbank-refund', transbank.refund)
ipcMain.on('transbank-close', transbank.closeDay)
ipcMain.on('transbank-detail', transbank.salesDetail)
ipcMain.on('transbank-last', transbank.getLastSale)
ipcMain.on('transbank-normal', transbank.changeToNormalMode)
ipcMain.on('transbank-status', transbank.status)
