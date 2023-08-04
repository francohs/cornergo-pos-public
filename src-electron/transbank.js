import TransbankSDK from 'transbank-pos-sdk'

const idsProduct = [546, 84]
const idsVendor = [4554, 2816]

const Transbank = new TransbankSDK.POSIntegrado()

async function connect() {
  const pos = {
    success: false,
    message: 'Transbank: Error al conectar'
  }
  try {
    pos.response = await Transbank.autoconnect()

    if (pos.response === false) {
      pos.message = 'Transbank: No se encontro dispositivo Transbank conectado'
    } else {
      pos.success = true
      pos.message = 'Transbank: Conectado'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function disconnect() {
  const pos = {
    success: false,
    message: 'Transbank: Error al desconectar'
  }
  try {
    pos.response = await Transbank.disconnect()
    pos.success = true
    pos.message = 'Transbank: Desconectado'
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function loadKeys() {
  const pos = {
    success: false,
    message: 'Transbank: Error al cargar llaves'
  }
  try {
    pos.response = await Transbank.loadKeys()

    if (pos.response.responseCode == 0) {
      pos.success = true
      pos.message = 'Transbank: Carga de llaves OK'
    } else if (pos.response.responseCode == 3) {
      pos.message = 'Transbank: Error en carga de llaves - conexión falló'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function sale(amount, ref) {
  const pos = {
    success: false,
    message: 'Transbank: Error al realizar venta'
  }
  try {
    pos.response = await Transbank.sale(amount, ref)

    if (!pos.response) {
      pos.message = 'Transbank: No existe comunicación con POS'
    } else if (pos.response.responseCode == 3) {
      pos.message =
        'Transbank: Error al realizar venta, reintente - Conexión falló'
    } else if (
      [7, 22].includes(pos.response.responseCode) &&
      pos.response.responseMessage == 'TIMEOUT'
    ) {
      pos.message =
        'Transbank: Tiempo de espera superado. Reintente Transacción'
    } else if (pos.response.responseCode == 7) {
      pos.message = 'Transbank: Transacción cancelada desde el POS'
    } else if ([1, 18].includes(pos.response.responseCode)) {
      pos.message = 'Transbank: Error en selección de tipo tarjeta, reintentar'
    } else {
      pos.success = true
      pos.message = 'Transbank: Venta realizada'
    }
  } catch (error) {
    pos.response = error
    if (error == 'Response of POS has not been received in 150 seconds')
      pos.message =
        'Transbank: La respuesta del POS a superado el tiempo de espera'
  } finally {
    return pos
  }
}

async function refund(operationNumber) {
  const pos = {
    success: false,
    message: 'Transbank: Error al realizar una devolución en POS'
  }
  try {
    pos.response = await Transbank.refund(operationNumber)

    if (pos.response.responseCode == 0) {
      pos.success = true
      pos.message = 'Transbank: Anulación realizada'
    } else if (pos.response.responseCode == 5) {
      pos.message = `Transbank: No existe transacción ${operationNumber} para anular`
    } else if (pos.response.responseCode == 6) {
      pos.message = `Transbank: Transacción ${operationNumber} ya ha sido anulada`
    } else if ([20, 8].includes(pos.response.responseCode)) {
      pos.message = 'Transbank: No puede anular transacción pagada con débito'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function closeDay() {
  const pos = {
    success: false,
    message: 'Transbank: Error al hacer cierre de ventas en POS'
  }
  try {
    pos.response = await Transbank.closeDay()

    if (pos.response.responseCode == 0) {
      pos.success = true
      pos.message = 'Transbank: Cierre de día OK'
    } else if (pos.response.responseCode == 3) {
      pos.message =
        'Transbank: Error al hacer cierre de ventas en POS, reintente - Conexión falló'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function salesDetail() {
  const pos = {
    success: false,
    message: 'Transbank: Error al obtener detalle de ventas en POS'
  }
  try {
    pos.response = await Transbank.salesDetail(true)

    if (pos.response == true) {
      pos.success = true
      pos.message = 'Transbank: Detalle de ventas OK'
    } else if (pos.response.responseCode == 11) {
      pos.message = 'Transbank: No Existen Ventas'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function getTotals() {
  const pos = {
    success: false,
    message: 'Transbank: Error al obtener totales en POS Transbank'
  }
  try {
    pos.response = await Transbank.getTotals(true)

    if (pos.response.responseCode == 0) {
      pos.success = true
      pos.message = 'Transbank: Totales OK'
    } else if (pos.response.responseCode == 11) {
      pos.message = 'Transbank: No Existen Ventas'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function getLastSale() {
  const pos = {
    success: false,
    message: 'Transbank: Error al obtener totales en POS'
  }
  try {
    pos.response = await Transbank.getLastSale(true)

    if (pos.response.responseCode == 0) {
      pos.success = true
      pos.message = 'Transbank: Última Venta OK'
    } else if (pos.response.responseCode == 11) {
      return 'Transbank: No Existen Ventas'
    }
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function changeToNormalMode() {
  const pos = {
    success: false,
    message: 'Transbank: Error al cambiar modo normal en POS Transbank'
  }
  try {
    pos.response = await Transbank.changeToNormalMode(true)
    pos.success = true
    pos.message = 'Transbank: Modo Normal OK'
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

async function status() {
  const pos = {
    success: false,
    message: 'Transbank: Error al obtener estado de POS Transbank'
  }
  try {
    pos.response = await Transbank.poll(true)
    pos.success = true
    pos.message = 'Transbank: Conectado'
  } catch (error) {
    pos.response = error
  } finally {
    return pos
  }
}

function isTransbank(usbDevice) {
  return (
    idsProduct.includes(usbDevice.deviceDescriptor.idProduct) &&
    idsVendor.includes(usbDevice.deviceDescriptor.idVendor)
  )
}

export default {
  connect,
  disconnect,
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
