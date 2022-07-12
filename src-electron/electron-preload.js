import escpos from 'escpos'
import escposUSB from 'escpos-usb'
escpos.USB = escposUSB
import moment from 'moment'
import { contextBridge, ipcRenderer } from 'electron'
import formatter from 'src/tools/formatter'

let device
try {
  device = new escpos.USB(0x04b8, 0x0202)
} catch (error) {
  console.error('[ERROR] IMPRESORA NO CONECTADA')
}
const printer = new escpos.Printer(device, {
  encoding: 'CP858'
})
const spaceLimit = 42

const getSpaces = (total, characters) => {
  let spaces = ''
  const nSpaces = total - characters
  for (space = 0; space < nSpaces; space++) {
    spaces = spaces + ' '
  }
  return spaces
}

contextBridge.exposeInMainWorld('printer', {
  cashdraw: () => {
    device.open(error => {
      if (error) console.error(error)
      printer.cashdraw().close()
    })
  },
  printCashClose: cashClose => {
    console.log({ cashClose })
    device.open(error => {
      if (error) console.error(error)

      const today = new Date()

      printer.align('lt').size(0.01, 0.01).control('cr')
      printer.style('b').text('Minimarket CornerGO').style('')
      printer.style('b').text('Cierre de Caja')
      printer.text('------------------------------------------')
      printer.feed(1)

      printer.style('b').text(`Resumen de ventas`).style('')
      printer.text('------------------------------------------')
      printer.text(`Total Ventas: ${formatter.currency(cashClose.totalSales)}`)
      printer.text(`Número de Ventas: ${cashClose.dtesQuantity}`)
      printer.text(`Efectivo: ${formatter.currency(cashClose.cash)}`)
      printer.text(`Tarjeta Débito: ${formatter.currency(cashClose.debit)}`)
      printer.text(`Tarjeta Cédito: ${formatter.currency(cashClose.credit)}`)
      printer.text(
        `Total Tarjetas: ${formatter.currency(cashClose.totalDebitCredit)}`
      )
      printer.text(`Transferencias: ${formatter.currency(cashClose.transfer)}`)
      printer.text(
        `Crédito Cliente: ${formatter.currency(cashClose.clientCredit)}`
      )
      printer.feed(1)

      printer.style('b').text(`Otros Ingresos`).style('')
      printer.text('------------------------------------------')
      cashClose.moves.forEach(move => {
        if (move.moveType == 'Otro Ingreso') {
          printer.text(
            `${formatter.time(move.createdAt)} ${
              move.description
            } ${formatter.currency(move.amount)}`
          )
        }
      })
      printer.feed(1)

      printer.style('b').text(`Otros Egresos`).style('')
      printer.text('------------------------------------------')
      cashClose.moves.forEach(move => {
        if (
          move.moveType == 'Otro Egreso' ||
          move.moveType == 'Pago a Proveedor'
        ) {
          printer.text(
            `${formatter.time(move.createdAt)} ${
              move.description
            } ${formatter.currency(move.amount)}`
          )
        }
      })
      printer.feed(1)

      printer.style('b').text(`Calculo cierre de caja`).style('')
      printer.text('------------------------------------------')
      printer
        .style('b')
        .text(
          `[${formatter.time(
            cashClose.createdAt
          )}] INICIO DE CAJA: ${formatter.currency(cashClose.openAmount)}`
        )
        .style('')
      printer.text(
        `Total Pagos en Efectivo: ${formatter.currency(cashClose.cash)}`
      )
      printer.text(
        `Total Otros Ingresos: ${formatter.currency(cashClose.totalInputs)}`
      )
      printer.text(
        `Total Otros Egresos: ${formatter.currency(cashClose.totalOutputs)}`
      )
      printer.text(`Total Vueltos: ${formatter.currency(cashClose.change)}`)
      printer
        .style('b')
        .text(
          `[${formatter.time(
            cashClose.updatedAt
          )}] CIERRE DE CAJA: ${formatter.currency(cashClose.closeAmount)}`
        )
        .style('')
      printer.feed(1)

      printer.text('------------------------------------------')
      printer
        .text(
          `Fecha: ${formatter.localDate(
            cashClose.updatedAt
          )}      Hora: ${formatter.time(cashClose.updatedAt)}`
        )
        .feed(1)
        .cut()
        .close()
    })
  },
  printPayment: (client, payment) => {
    device.open(error => {
      if (error) console.error(error)

      const today = new Date()

      printer.align('lt').size(0.01, 0.01).control('cr')
      printer.style('b').text('Minimarket CornerGO').style('')
      printer.style('b').text('Abono Cliente').style('')
      printer.text('------------------------------------------').feed(1)

      printer.text(`Cliente: ${client.name}`)
      printer.text(`Abono: ${formatter.currency(parseInt(payment.amount))}`)
      printer.text(`Tipo de Pago: ${payment.payType}`)
      printer.text(
        `Saldo Anterior: ${formatter.currency(parseInt(client.balance))}`
      )
      printer.text(
        `Saldo Actual: ${formatter.currency(
          parseInt(client.balance) + parseInt(payment.amount)
        )}`
      )

      printer.feed(1).text('------------------------------------------')
      printer
        .text(
          `Fecha: ${formatter.localDate(today)}      Hora: ${formatter.time(
            today
          )}`
        )
        .feed(1)
        .cut()
        .close()
    })
  },
  printDte: (dte, tedPdf417) => {
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

      escpos.Image.load(tedPdf417, function (image) {
        printer.image(image).then(() => {
          printer.feed(1)
          printer.text('Timbre Electrónico S.I.I')
          printer.text('Res. 80 del 22-08-2014')
          printer.text('Verifique Documento: www.sii.cl')
          printer.feed(1).cut().close()
        })
      })
    })
  }
})

contextBridge.exposeInMainWorld('updater', {
  send: channel => {
    ipcRenderer.send(channel)
  },
  receive: (channel, func) => {
    ipcRenderer.removeAllListeners(channel)
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  }
})
