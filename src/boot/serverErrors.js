import notify from 'tools/notify'

const ServerErrors = {
  NotFound: 'El usuario no existe',
  Unauthorized: 'Acceso no autorizado',
  AuthTokenIncorrect: 'Acceso no autorizado',
  AuthTokenMissing: 'Sesion expirada',
  IncorrectPassword: 'Contraseña incorrecta'
}

export default function errorInterceptor(axiosError) {
  console.error(axiosError.response)

  if (axiosError.response) {
    if (axiosError.response.data) {
      const error = axiosError.response.data.error
      console.error(error)

      if (Object.keys(ServerErrors).includes(error)) {
        notify.negative(ServerErrors[error])
      }
    }
  }

  return Promise.reject(axiosError)
}
