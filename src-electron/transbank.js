import TransbankSDK from 'transbank-pos-sdk'

const idProduct = 546
const idVendor = 4554

const Transbank = new TransbankSDK.POSIntegrado()

async function connect() {
  try {
    const port = await Transbank.autoconnect()

    if (port === false) {
      return 'Transbank: No se encontro dispositivo Transbank conectado'
    }

    return 'Transbank: Conectado'
  } catch (error) {
    console.error(error)
    return 'Transbank: Error al conectar'
  }
}

async function loadKeys() {
  try {
    const response = await Transbank.loadKeys()
    console.log(response)

    if (response.responseCode == 0) {
      return 'Transbank: Carga de llaves OK'
    } else if (response.responseCode == 3) {
      return 'Transbank: Error en carga de llaves - conexión falló'
    } else {
      return 'Transbank: Error al cargar llaves'
    }
  } catch (error) {
    console.error(error)
    return 'Transbank: Error al cargar llaves'
  }
}

async function sale(amount, ref) {
  try {
    const response = await Transbank.sale(amount, ref)
    console.log(response)

    if (!response) return 'Transbank: No existe comunicación con POS'

    if (response.responseCode == 3) {
      return 'Transbank: Error al realizar venta, reintente - Conexión falló'
    }

    if (
      [7, 22].includes(response.responseCode) &&
      response.responseMessage == 'TIMEOUT'
    ) {
      return 'Transbank: Tiempo de espera superado. Reintente Transacción'
    }

    if (response.responseCode == 7) {
      return 'Transbank: Transacción cancelada desde el POS'
    }

    if ([1, 18].includes(response.responseCode)) {
      return 'Transbank: Error en selección de tipo tarjeta, reintentar'
    }

    return response
  } catch (error) {
    if (error == 'Response of POS has not been received in 150 seconds')
      return 'Transbank: Error al conectar'
    return 'Transbank: Error al realziar una venta'
  }
}

async function refund(operationNumber) {
  try {
    const response = await Transbank.refund(operationNumber)
    console.log(response)

    if (response.responseCode == 0) {
      return 'Transbank: Anulación OK'
    } else if (response.responseCode == 5) {
      return `Transbank: No existe transacción ${operationNumber} para anular`
    } else if (response.responseCode == 6) {
      return `Transbank: Transacción ${operationNumber} ya ha sido anulada`
    } else if ([20, 8].includes(response.responseCode)) {
      return 'Transbank: No puede anular transacción pagada con débito'
    } else {
      return 'Transbank: Error al realizar una devolución en POS'
    }
  } catch (error) {
    return 'Transbank: Error al realizar una devolución en POS'
  }
}

async function closeDay() {
  try {
    const response = await Transbank.closeDay()
    console.log(response)

    if (response.responseCode == 0) {
      return 'Transbank: Cierre de día OK'
    } else if (response.responseCode == 3) {
      return 'Transbank: Error al hacer cierre de ventas en POS, reintente - Conexión falló'
    } else {
      return 'Transbank: Error al hacer cierre de ventas en POS'
    }
  } catch (error) {
    return 'Transbank: Error al hacer cierre de ventas en POS'
  }
}

async function salesDetail() {
  try {
    const response = await Transbank.salesDetail(true)
    console.log(response)

    if (response == true) {
      return 'Transbank: Detalle de ventas OK'
    }
    if (response.responseCode == 11) {
      return 'Transbank: No Existen Ventas'
    } else {
      return 'Transbank: Error al obtener detalle de ventas en POS'
    }
  } catch (error) {
    return 'Transbank: Error al obtener detalle de ventas en POS'
  }
}

async function getTotals() {
  try {
    const response = await Transbank.getTotals(true)
    console.log(response)

    if (response.responseCode == 11) {
      console.error('No Existen Ventas')
    }

    return response.responseCode == 0
  } catch (error) {
    console.error('Error al obtener totales en POS Transbank')
  }
}

async function getLastSale() {
  try {
    const response = await Transbank.getLastSale(true)
    console.log(response)

    return response
  } catch (error) {
    return 'Transbank: Error al obtener totales en POS'
  }
}

async function changeToNormalMode() {
  try {
    const response = await Transbank.changeToNormalMode(true)
    console.log(response)
    return true
  } catch (error) {
    console.error('Error al cambiar modo normal en POS Transbank')
  }
}

async function status() {
  try {
    const response = await Transbank.poll(true)
    console.log(response)
    return true
  } catch (error) {
    console.error('Error al obtener estado de POS Transbank')
    return false
  }
}

function isTransbank(usbDevice) {
  return (
    usbDevice.deviceDescriptor.idVendor == idVendor &&
    usbDevice.deviceDescriptor.idProduct == idProduct
  )
}

export default {
  connect,
  loadKeys,
  sale,
  refund,
  closeDay,
  salesDetail,
  getTotals,
  getLastSale,
  changeToNormalMode,
  status,
  isTransbank
}
