import escpos from 'escpos'
import escposUSB from 'escpos-usb'
import moment from 'moment'
import formatter from 'src/tools/formatter'
import { getDeviceList } from 'usb'

const vendorTM20II = 1208
const productTM20II = 3605
const productTM88V = 514

let device
let printer
let spaceLimit

function isPrinter(usbDevice) {
  return (
    usbDevice.deviceDescriptor.idVendor == vendorTM20II &&
    [productTM20II, productTM88V].includes(usbDevice.deviceDescriptor.idProduct)
  )
}

function findPrinter() {
  return !!getDeviceList().find(isPrinter)
}

function connectPrinter() {
  try {
    device = new escposUSB(1208, 514) // TM-88
    spaceLimit = 42
  } catch (error) {
    device = new escposUSB(1208, 3605) // TM-20
    spaceLimit = 48
    // console.error(error)
  }
  printer = new escpos.Printer(device, {
    encoding: 'CP858'
  })
}

function cashdraw() {
  connectPrinter()
  device.open(error => {
    if (error) console.error(error)
    printer.cashdraw().close()
  })
}

function printCashClose(event, cashMove) {
  connectPrinter()
  device.open(error => {
    if (error) console.error(error)

    printer.align('lt').size(0.01, 0.01).control('cr')
    printer.style('b').text('Minimarket CornerGO').style('')
    printer.style('b').text('Cierre de Caja').style('')
    printer.text(`Cajero: ${cashMove.user.name} ${cashMove.user.lastName}`)
    printer.text(separator())
    printer.feed(1)

    printer.style('b').text(`Resumen de ventas`).style('')
    printer.text(separator())
    printer.text(
      `Total Ventas (${cashMove.totalSales.count}): ${formatter.currency(
        cashMove.totalSales.amount
      )}`
    )
    printer.text(
      `Efectivo (${cashMove.cash.count}): ${formatter.currency(
        cashMove.cash.amount
      )}`
    )
    printer.text(
      `Tarjeta Débito (${cashMove.debit.count}): ${formatter.currency(
        cashMove.debit.amount
      )}`
    )
    printer.text(
      `Tarjeta Crédito (${cashMove.credit.count}): ${formatter.currency(
        cashMove.credit.amount
      )}`
    )
    printer.text(
      `Total Tarjetas (${
        cashMove.debit.count + cashMove.credit.count
      }): ${formatter.currency(cashMove.debit.amount + cashMove.credit.amount)}`
    )
    printer.text(
      `Transferencias (${cashMove.transfer.count}): ${formatter.currency(
        cashMove.transfer.amount
      )}`
    )
    printer.text(
      `Crédito Cliente (${cashMove.clientCredit.count}): ${formatter.currency(
        cashMove.clientCredit.amount
      )}`
    )
    printer.feed(1)

    printer.style('b').text(`Otros Ingresos`).style('')
    printer.text(separator())
    cashMove.moves.forEach(move => {
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
    printer.text(separator())
    cashMove.moves.forEach(move => {
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
    printer.text(separator())
    printer
      .style('b')
      .text(
        `[${formatter.time(
          cashMove.createdAt
        )}] INICIO DE CAJA: ${formatter.currency(cashMove.openAmount)}`
      )
      .style('')
    printer.text(
      `Total Pagos en Efectivo: ${formatter.currency(cashMove.cash.amount)}`
    )
    printer.text(
      `Total Otros Ingresos: ${formatter.currency(cashMove.totalInputs)}`
    )
    printer.text(
      `Total Otros Egresos: ${formatter.currency(cashMove.totalOutputs)}`
    )
    printer
      .style('b')
      .text(
        `[${formatter.time(
          cashMove.updatedAt
        )}] CIERRE DE CAJA: ${formatter.currency(cashMove.closeAmount)}`
      )
      .style('')
    printer.feed(1)

    printer.text(separator())
    printer
      .text(
        `Fecha: ${formatter.localDate(
          cashMove.updatedAt
        )}      Hora: ${formatter.time(cashMove.updatedAt)}`
      )
      .feed(1)
      .cut()
      .close()
  })
}

function printPayment(event, client, payment) {
  connectPrinter()
  device.open(error => {
    if (error) console.error(error)

    const today = new Date()

    printer.align('lt').size(0.01, 0.01).control('cr')
    printer.style('b').text('Minimarket CornerGO').style('')
    printer.style('b').text('Abono Cliente').style('')
    printer.text(separator()).feed(1)

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

    printer.feed(1).text(separator())
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
}

function printDte(event, dte, voucher) {
  connectPrinter()
  const emissionDate = moment(dte.emissionDate)

  device.open(error => {
    if (error) console.error(error)

    printer.size(0.01, 0.01).control('cr').align('lt')

    printer.style('b').text('MINIMARKET CORNERGO').style('')
    printer.text('Servicios de Ingeniería BigVision SpA')
    printer.text('RUT: 76.260.131-1')
    printer.text('Casa Matriz: Freire 1698, Concepción')
    printer.text('Giro: Minimarket').feed(1)

    printer.text(`${dte.dteTypeName}: ${dte.number}`)
    printer.text(
      `Fecha: ${formatter.localDate(emissionDate)}   Hora: ${formatter.time(
        emissionDate
      )}`
    )
    printer.text(`Vendedor: ${dte.sellerName}`).feed(1)

    printer.text(spaceBetween('Producto   Cantidad X Precio', 'Sub-Total'))
    printer.text(separator())

    for (item of dte.items) {
      printer.text(truncate(item.name))

      printer.text(
        spaceBetween(
          `${item.quantity} x ${formatter.currency(item.price)}`,
          formatter.currency(item.subtotal)
        )
      )
    }
    printer.text(separator()).align('rt')

    const roundedAmount = Math.abs(dte.totalAmount - dte.roundedTotal)
    const anyCashPay = dte.pays.findIndex(p => p.payType == 'Efectivo')
    if (anyCashPay > -1 && roundedAmount > 0) {
      printer.text(totalText('Ley N° 20.956:', roundedAmount))
    }

    printer.style('b').text(totalText('TOTAL:', dte.roundedTotal)).style('')
    printer.text(totalText('NETO:', dte.netAmount))

    if (dte.exemptAmount) printer.text(totalText('EXENTO:', dte.exemptAmount))

    if (dte.taxAmount) printer.text(totalText('IVA:', dte.taxAmount))

    for (pay of dte.pays) {
      printer.text(totalText(`Pago ${pay.payType}:`, pay.amount))

      if (pay.payType == 'Credito Cliente')
        printer.text(totalText(`Saldo ${dte.client.name}:`, dte.client.balance))
    }

    if (dte.pays.length > 1)
      printer.text(totalText('Total Pagado:', dte.totalPay))

    if (dte.changeAmount) printer.text(totalText('Vuelto:', dte.changeAmount))

    printer.align('ct')
    printer.feed(1)

    escpos.Image.load(dte.pdf417, function (image) {
      printer.image(image).then(() => {
        printer.feed(1)
        printer.text('Timbre Electrónico S.I.I')
        printer.text('Res. 80 del 22-08-2014')
        printer.text('Verifique Documento: www.sii.cl')

        if (voucher) {
          printer.feed(1)
          printer.text(separator())
          const cardType = voucher.cardType == 'CR' ? 'Credito' : 'Debito'
          printer
            .style('b')
            .text(`Venta Tarjeta de ${cardType}`.toUpperCase())
            .style('')
          printer.text('Minimarket CornerGO')
          printer.text('Freire 1698, Concepción')
          printer.text(`${voucher.commerceCode} - ${voucher.terminalId}`)

          printer.text(
            spaceBetween(
              `${voucherDate(voucher)}    ${voucherTime(voucher)}`,
              `${voucher.cardType}/${voucher.cardBrand} ****${voucher.last4Digits}`
            )
          )
          printer.text(
            spaceBetween('TOTAL:', formatter.currency(voucher.amount))
          )
          if (voucher.sharesAmount) {
            printer.text(spaceBetween('Cuotas:', voucher.sharesNumber))
            printer.text(
              spaceBetween(
                'Monto Cuota:',
                formatter.currency(voucher.sharesAmount)
              )
            )
          }

          printer.text(
            spaceBetween('Número Operación:', voucher.operationNumber)
          )
          printer.text(
            spaceBetween('Número Autorización:', voucher.authorizationCode)
          )
        }

        printer.feed(1).cut().close()
      })
    })
  })
}

function voucherDate(voucher) {
  const day = voucher.realDate.slice(0, 2)
  const month = voucher.realDate.slice(2, 4)
  const year = voucher.realDate.slice(4, 8)
  return `${day}/${month}/${year}`
}

function voucherTime(voucher) {
  const hour = voucher.realTime.slice(0, 2)
  const minute = voucher.realTime.slice(2, 4)
  const second = voucher.realTime.slice(4, 6)
  return `${hour}:${minute}:${second}`
}

function totalText(str1, str2) {
  const rigthOffset = 12
  str2 = formatter.currency(str2)
  const nSpaces = rigthOffset - str2.length
  let spaces = ''
  for (space = 0; space < nSpaces; space++) {
    spaces = spaces + ' '
  }
  return str1 + spaces + str2
}

function spaceBetween(str1, str2) {
  let spaces = ''
  const nSpaces = spaceLimit - str1.toString().length - str2.toString().length
  for (let space = 0; space < nSpaces; space++) {
    spaces = spaces + ' '
  }
  return str1 + spaces + str2
}

function separator() {
  let spaces = ''
  for (let space = 0; space < spaceLimit; space++) {
    spaces = spaces + '-'
  }
  return spaces
}

function truncate(str) {
  return str.length > spaceLimit ? str.slice(0, spaceLimit) : str
}

export default {
  isPrinter,
  findPrinter,
  cashdraw,
  printCashClose,
  printPayment,
  printDte
}
