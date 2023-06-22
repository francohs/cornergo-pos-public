import TransbankSDK from 'transbank-pos-sdk'

async function init() {
  try {
    const port = await Transbank.autoconnect()

    if (port === false) {
      throw Error('No se encontró Transbank conectado')
    }

    await loadKeys()

    return true
  } catch (error) {
    if (error == 'Response of POS has not been received in 150 seconds')
      throw error
    throw Error('Error al conectar Transbank')
  }
}

async function loadKeys() {
  try {
    const response = await Transbank.loadKeys()

    if (response.responseCode == 3) {
      throw Error('Error al Cargar llaves, reintente - Conexión falló')
    }

    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al cargar llaves')
  }
}

async function sale(amount, ref) {
  try {
    const response = await Transbank.sale(amount, ref)

    if (!response) throw Error('No existe comunicación con POS Transbank')

    if (response.responseCode == 3) {
      throw Error(
        'Error al realizar venta en POS Transbank, reintente - Conexión falló'
      )
    }

    if (
      [7, 22].includes(response.responseCode) &&
      response.responseMessage == 'TIMEOUT'
    ) {
      throw Error('Tiempo de espera superado. Reintente Transacción')
    }

    if (response.responseCode == 7) {
      throw Error('Transacción cancelada desde POS Transbank')
    }

    if ([1, 18].includes(response.responseCode)) {
      throw Error('Error en selección de tipo tarjeta, reintentar')
    }

    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al realizar venta en POS Transbank')
  }
}

async function refund(operationNumber) {
  try {
    const response = await Transbank.refund(operationNumber)

    if (response.responseCode == 5) {
      throw Error('No Existe Transacción para Anular')
    }
    if ([20, 8].includes(response.responseCode)) {
      throw Error('No puede anular transacción de débito')
    }

    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al realizar una devolución en POS Transbank')
  }
}

async function closeDay() {
  try {
    const response = await Transbank.closeDay()

    if (response.responseCode == 3) {
      throw Error(
        'Error al hacer cierre de ventas en POS Transbank, reintente - Conexión falló'
      )
    }

    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al hacer cierre de ventas en POS Transbank')
  }
}

async function salesDetail() {
  try {
    const response = await Transbank.salesDetail(true)

    if (response.responseCode == 11) {
      throw Error('No Existen Ventas')
    }

    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al obtener detalle de ventas en POS Transbank')
  }
}

async function getTotals() {
  try {
    const response = await Transbank.getTotals(true)

    if (response.responseCode == 11) {
      throw Error('No Existen Ventas')
    }

    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al obtener totales en POS Transbank')
  }
}

async function getLastSale() {
  try {
    const response = await Transbank.getLastSale(true)
    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al obtener totales en POS Transbank')
  }
}

async function changeToNormalMode() {
  try {
    const response = await Transbank.changeToNormalMode(true)
    return true
  } catch (error) {
    throw Error('Error al cambiar modo normal en POS Transbank')
  }
}

async function status() {
  try {
    const response = await Transbank.poll(true)
    return response.responseCode == 0
  } catch (error) {
    throw Error('Error al obtener estado de POS Transbank')
  }
}

export default {
  init,
  loadKeys,
  sale,
  refund,
  closeDay,
  salesDetail,
  getTotals,
  getLastSale,
  changeToNormalMode,
  status
}
