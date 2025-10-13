// Храним экземпляр модального окна
let errorModalInstance = null

const ErrorModalPlugin = {
  install(app, options) {
    // Метод для установки экземпляра модального окна
    app.config.globalProperties.$setErrorModal = (instance) => {
      errorModalInstance = instance
    }
    
    // Метод для показа ошибки
    app.config.globalProperties.$showError = (message) => {
      if (errorModalInstance && typeof errorModalInstance.show === 'function') {
        errorModalInstance.show(message)
      } else {
        console.warn('ErrorModal instance not set or show method not available')
        // Fallback - обычный alert
        alert(`Ошибка: ${message}`)
      }
    }

    // Также предоставляем через provide/inject
    app.provide('showError', (message) => {
      app.config.globalProperties.$showError(message)
    })
  }
}

// Отдельная функция для использования в JS файлах
export const showGlobalError = (message) => {
  if (errorModalInstance && typeof errorModalInstance.show === 'function') {
    errorModalInstance.show(message)
  } else {
    console.warn('ErrorModal instance not set')
    alert(`Ошибка: ${message}`)
  }
}

export default ErrorModalPlugin