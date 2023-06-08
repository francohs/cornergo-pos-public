import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import os from 'os'
import { usb, getDeviceList } from 'usb'

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
const vendorTM20II = 1208
const productTM20II = 3605
// const productTM88V = 514

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

const findTM20II = usbDevice =>
  usbDevice.deviceDescriptor.idVendor == vendorTM20II &&
  usbDevice.deviceDescriptor.idProduct == productTM20II

ipcMain.on('printer-status', () => {
  const usbDevices = getDeviceList()
  const printerStatus = usbDevices.find(findTM20II)
  mainWindow.webContents.send('printer-status', !!printerStatus)
})

usb.on('attach', function (device) {
  if (findTM20II(device)) mainWindow.webContents.send('printer-status', true)
})
usb.on('detach', function (device) {
  if (findTM20II(device)) mainWindow.webContents.send('printer-status', false)
})

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall()
})

import escpos from 'escpos'
import escposUSB from 'escpos-usb'
import moment from 'moment'
import formatter from 'src/tools/formatter'

let device
let printer
const spaceLimit = 42

function printerConnect() {
  try {
    // device = new escpos.USB(0x04b8, 0x0202) // TM-88
    device = new escposUSB(0x04b8, 0x0e15) // TM-20
    printer = new escpos.Printer(device, {
      encoding: 'CP858'
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

ipcMain.on('print-dte', (event, { dte, ted }) => {
  printerConnect()
  const emissionDate = moment(dte.emissionDate)

  device.open(error => {
    if (error) console.error(error)

    printer.align('lt').size(0.01, 0.01).control('cr')
    printer.style('b').text('Minimarket CornerGO').style('')

    printer
      .text('Servicios de Ingeniería BigVision SpA')
      .text('RUT: 76.260.131-1')
      .text('Casa Matriz: Freire 1698, Concepción')
      .text('Giro: Minimarket')
      .feed(1)

    printer.text(`${dte.dteTypeName}: ${dte.number}`)
    printer
      .text(
        `Fecha: ${formatter.localDate(
          emissionDate
        )}      Hora: ${formatter.time(emissionDate)}`
      )
      .text(`Vendedor: ${dte.sellerName}`)
      .feed(1)

    printer.text('Producto   Cantidad X Precio     Sub-Total').style('')
    printer.text('------------------------------------------') // spaceLimit espacios

    for (item of dte.items) {
      const truncName =
        item.name.length > spaceLimit
          ? item.name.slice(0, spaceLimit)
          : item.name
      printer.align('lt').text(truncName)

      const textQtyPrice = `${item.quantity} x ${formatter.currency(
        item.price
      )}`
      const textSubtotal = formatter.currency(item.subtotal)
      const spaces = getSpaces(
        spaceLimit,
        textQtyPrice.length + textSubtotal.length
      )
      printer.text(textQtyPrice + spaces + textSubtotal)
    }
    printer.text('------------------------------------------')

    const roundedAmount = Math.abs(dte.totalAmount - dte.roundedTotal)
    const textRoundedAmount = formatter.currency(roundedAmount) + ' '
    const roundedTotal = formatter.currency(dte.roundedTotal) + ' '
    const textExemptAmount = formatter.currency(dte.exemptAmount) + ' '
    const textTotalPay = formatter.currency(dte.totalPay) + ' '
    const textChangeAmount = formatter.currency(dte.changeAmount) + ' '

    printer.align('rt')

    const anyCashPay = dte.pays.findIndex(p => p.payType == 'Efectivo')

    if (anyCashPay > -1 && roundedAmount > 0) {
      printer.text(
        'Ley N° 20.956:' +
          getSpaces(11, textRoundedAmount.length) +
          textRoundedAmount
      )
    }

    printer.text('TOTAL:' + getSpaces(11, roundedTotal.length) + roundedTotal)

    if (dte.exemptAmount) {
      printer.text(
        'TOTAL EXENTO:' +
          getSpaces(11, textExemptAmount.length) +
          textExemptAmount
      )
    }

    for (pay of dte.pays) {
      const payAmount = formatter.currency(pay.amount) + ' '
      printer.text(
        `Pago ${pay.payType}:` + getSpaces(11, payAmount.length) + payAmount
      )
      if (pay.payType == 'Credito Cliente') {
        const clientBalance = formatter.currency(dte.client.balance) + ' '
        printer.text(
          `Saldo ${dte.client.name}:` +
            getSpaces(11, clientBalance.length) +
            clientBalance
        )
      }
    }
    if (dte.pays.length > 1) {
      printer.text(
        'Total Pagado:' + getSpaces(11, textTotalPay.length) + textTotalPay
      )
    }

    printer.text(
      'Vuelto:' + getSpaces(11, textChangeAmount.length) + textChangeAmount
    )
    printer.align('ct')
    printer.feed(1)

    escpos.Image.load(ted, function (image) {
      console.log(image)
      printer.image(image).then(() => {
        printer.feed(1)
        printer.text('Timbre Electrónico S.I.I')
        printer.text('Res. 80 del 22-08-2014')
        printer.text('Verifique Documento: www.sii.cl')
        printer.feed(1).cut().close()
      })
    })
  })
})

const getSpaces = (total, characters) => {
  let spaces = ''
  const nSpaces = total - characters
  for (space = 0; space < nSpaces; space++) {
    spaces = spaces + ' '
  }
  return spaces
}
