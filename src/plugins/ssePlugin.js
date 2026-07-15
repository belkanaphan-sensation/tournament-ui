// plugins/ssePlugin.js
const SSEPlugin = {
  install(app, options = {}) {
    // Используем переменную окружения
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    
    // Конфигурация по умолчанию
    const config = {
      baseUrl: baseUrl,
      endpoint: options.endpoint || '/notifications/stream',
      autoConnect: options.autoConnect !== false,
      autoReconnect: options.autoReconnect !== false,
      reconnectDelay: options.reconnectDelay || 5000
    }

    console.log('[SSE Plugin] Base URL:', config.baseUrl)

    // Состояние SSE
    const state = {
      connection: null,
      connected: false,
      audioContext: null,
      soundEnabled: true,
      soundVolume: 1,
      toastAutoCloseTime: 10000,
      activeToasts: new Map(),
      eventHandlers: new Map(),
      reconnectTimer: null,
      isDestroyed: false
    }

    // Загрузка настроек из localStorage
    const loadSoundSettings = () => {
      const saved = localStorage.getItem('notificationSoundSettings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          state.soundEnabled = settings.enabled !== undefined ? settings.enabled : true
          state.soundVolume = settings.volume || 0.3
        } catch (error) {
          console.log('Failed to load sound settings:', error)
        }
      }
    }

    // Сохранение настроек в localStorage
    const saveSoundSettings = () => {
      const settings = {
        enabled: state.soundEnabled,
        volume: state.soundVolume
      }
      localStorage.setItem('notificationSoundSettings', JSON.stringify(settings))
    }

    // Инициализация AudioContext при клике
    const setupAudioActivation = () => {
      const activateAudio = () => {
        if (!state.audioContext) {
          try {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            console.log('[SSE] AudioContext created after user interaction')
          } catch (error) {
            console.log('[SSE] Failed to create AudioContext:', error)
          }
          
          document.removeEventListener('click', activateAudio)
          document.removeEventListener('keydown', activateAudio)
          document.removeEventListener('touchstart', activateAudio)
        }
      }
      
      document.addEventListener('click', activateAudio)
      document.addEventListener('keydown', activateAudio)
      document.addEventListener('touchstart', activateAudio)
    }

    // Показать уведомление
    const showNotification = (message) => {
      console.log('[SSE] Notification:', message)
      
      const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      const toast = document.createElement('div')
      toast.id = toastId
      toast.className = 'notification-toast'
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      toast.innerHTML = `
        <div class="toast-content">
          <div class="toast-header">
            <span class="toast-icon">🔔</span>
            <span class="toast-time">${time}</span>
            <button class="toast-close" aria-label="Закрыть">&times;</button>
          </div>
          <div class="toast-message">${escapeHtml(message)}</div>
        </div>
      `
      
      const style = document.createElement('style')
      style.textContent = getToastStyles()
      toast.appendChild(style)
      
      document.body.appendChild(toast)
      
      state.activeToasts.set(toastId, toast)
      
      const closeBtn = toast.querySelector('.toast-close')
      closeBtn.addEventListener('click', () => {
        closeToast(toastId)
      })
      
      toast.addEventListener('click', (e) => {
        if (!e.target.closest('.toast-close')) {
          console.log('Toast clicked:', message)
        }
      })
      
      const autoCloseTimer = setTimeout(() => {
        closeToast(toastId)
      }, state.toastAutoCloseTime)
      
      toast._autoCloseTimer = autoCloseTimer
      
      return toastId
    }

    const closeToast = (toastId) => {
      const toast = state.activeToasts.get(toastId)
      if (!toast) return
      
      if (toast._autoCloseTimer) {
        clearTimeout(toast._autoCloseTimer)
      }
      
      toast.style.animation = 'toastSlideOut 0.3s ease-out'
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
        state.activeToasts.delete(toastId)
        emitEvent('toast-closed', toastId)
      }, 300)
    }

    const closeAllToasts = () => {
      for (const [toastId] of state.activeToasts) {
        closeToast(toastId)
      }
      state.activeToasts.clear()
    }

    const getToastStyles = () => {
      return `
        .notification-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-left: 4px solid #4ecdc4;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 9998;
          min-width: 300px;
          max-width: 400px;
          animation: toastSlideIn 0.3s ease-out;
          overflow: hidden;
        }
        
        .toast-content { padding: 15px; }
        .toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .toast-icon { font-size: 16px; }
        .toast-time {
          font-size: 12px;
          color: #666;
          margin-left: 8px;
        }
        
        .toast-close {
          background: none;
          border: none;
          font-size: 20px;
          color: #999;
          cursor: pointer;
          padding: 0;
          margin: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .toast-close:hover {
          background: #f5f5f5;
          color: #666;
        }
        
        .toast-message {
          color: #333;
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
        }
        
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification-toast ~ .notification-toast { top: 90px; }
        .notification-toast ~ .notification-toast ~ .notification-toast { top: 160px; }
        .notification-toast ~ .notification-toast ~ .notification-toast ~ .notification-toast { top: 230px; }
      `
    }

    const escapeHtml = (text) => {
      if (text == null) return ''
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    // ========== ЗВУКОВАЯ СИСТЕМА ==========
    
    const getSoundSettings = (type) => {
      const sounds = {
        'default': {
          frequency: 800,
          waveType: 'sine',
          duration: 0.3,
          attack: 0.01
        },
        'success': {
          frequency: 659.25,
          waveType: 'sine',
          duration: 0.4,
          attack: 0.05
        },
        'warning': {
          frequency: 523.25,
          waveType: 'square',
          duration: 0.2,
          attack: 0.01
        },
        'error': {
          frequency: 392,
          waveType: 'sawtooth',
          duration: 0.5,
          attack: 0.02
        }
      }
      
      return sounds[type] || sounds.default
    }

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    const playSimpleBeep = () => {
      try {
        const audio = new Audio()
        const duration = 0.1
        const sampleRate = 8000
        const samples = Math.round(sampleRate * duration)
        
        const buffer = new ArrayBuffer(44 + samples * 2)
        const view = new DataView(buffer)
        
        // Заголовок WAV
        writeString(view, 0, 'RIFF')
        view.setUint32(4, 36 + samples * 2, true)
        writeString(view, 8, 'WAVE')
        writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, 1, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, sampleRate * 2, true)
        view.setUint16(32, 2, true)
        view.setUint16(34, 16, true)
        writeString(view, 36, 'data')
        view.setUint32(40, samples * 2, true)
        
        // Данные (простой beep на 800 Гц)
        let offset = 44
        for (let i = 0; i < samples; i++) {
          const sample = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.5
          view.setInt16(offset, sample * 0x7FFF, true)
          offset += 2
        }
        
        const blob = new Blob([buffer], { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        
        audio.src = url
        audio.volume = state.soundVolume
        
        audio.play().then(() => {
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }).catch(error => {
          console.log('Simple beep failed:', error)
          URL.revokeObjectURL(url)
        })
        
      } catch (error) {
        console.log('All sound methods failed:', error)
      }
    }

    const playWebAudioSound = (type) => {
      try {
        if (!state.audioContext || state.audioContext.state === 'closed') {
          console.log('[SSE] AudioContext not available, using simple beep')
          playSimpleBeep()
          return
        }

        const oscillator = state.audioContext.createOscillator()
        const gainNode = state.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(state.audioContext.destination)
        
        const settings = getSoundSettings(type)
        
        oscillator.frequency.value = settings.frequency
        oscillator.type = settings.waveType
        
        const now = state.audioContext.currentTime
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(state.soundVolume, now + settings.attack)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + settings.duration)
        
        oscillator.start(now)
        oscillator.stop(now + settings.duration)
        
        console.log('[SSE] Web Audio sound played')
        
      } catch (error) {
        console.log('[SSE] Web Audio API failed:', error)
        playSimpleBeep()
      }
    }

    const playNotificationSound = (type = 'default') => {
      if (!state.soundEnabled) {
        console.log('[SSE] Sound disabled by user')
        return
      }
      
      // Если AudioContext еще не создан, используем fallback звук
      if (!state.audioContext) {
        console.log('[SSE] AudioContext not ready, using simple beep')
        playSimpleBeep()
        return
      }
      
      // Проверяем состояние AudioContext
      if (state.audioContext.state === 'suspended') {
        console.log('[SSE] AudioContext suspended, trying to resume...')
        state.audioContext.resume().then(() => {
          playWebAudioSound(type)
        }).catch(error => {
          console.log('[SSE] Failed to resume AudioContext:', error)
          playSimpleBeep()
        })
      } else {
        playWebAudioSound(type)
      }
    }

    const playSoundForNotification = (message) => {
      let soundType = 'default'
      
      if (message.includes('успех') || message.includes('success') || 
          message.includes('готово') || message.includes('done')) {
        soundType = 'success'
      } else if (message.includes('ошибка') || message.includes('error') || 
                 message.includes('проблема') || message.includes('problem')) {
        soundType = 'error'
      } else if (message.includes('внимание') || message.includes('warning') || 
                 message.includes('осторожно')) {
        soundType = 'warning'
      }
      
      playNotificationSound(soundType)
    }

    // ========== КОНЕЦ ЗВУКОВОЙ СИСТЕМЫ ==========

    // Система событий
    const on = (event, handler) => {
      if (!state.eventHandlers.has(event)) {
        state.eventHandlers.set(event, [])
      }
      state.eventHandlers.get(event).push(handler)
    }

    const off = (event, handler) => {
      if (state.eventHandlers.has(event)) {
        const handlers = state.eventHandlers.get(event)
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }

    const emitEvent = (event, data) => {
      if (state.eventHandlers.has(event)) {
        state.eventHandlers.get(event).forEach(handler => handler(data))
      }
    }

    // Подключение к SSE
    const connect = (customEndpoint) => {
      disconnect()
      
      const endpoint = customEndpoint || config.endpoint;
      const url = `${config.baseUrl}${endpoint}`
      
      console.log('[SSE] Connecting to:', url)
      

      state.connection = new EventSource(url, { withCredentials: true, userId: 3 })
      
      state.connection.onopen = () => {
        state.connected = true
        console.log('[SSE] Connection established')
        emitEvent('connected')
        
        if (state.reconnectTimer) {
          clearTimeout(state.reconnectTimer)
          state.reconnectTimer = null
        }
      }
      
      state.connection.onerror = (error) => {
        console.error('[SSE] Error:', error)
        state.connected = false
        emitEvent('error', error)
        
        // Автопереподключение
        if (config.autoReconnect && !state.isDestroyed) {
          if (state.reconnectTimer) clearTimeout(state.reconnectTimer)
          state.reconnectTimer = setTimeout(() => {
            console.log('[SSE] Attempting to reconnect...')
            connect(endpoint)
          }, config.reconnectDelay)
        }
      }
      
      // Обработчик уведомлений
      const isSilentNotification = (rawMessage) => {
        if (rawMessage === 'DISPLAY_UPDATED') return true
        if (typeof rawMessage !== 'string' || !rawMessage.startsWith('{')) return false
        try {
          const payload = JSON.parse(rawMessage)
          return payload?.type === 'JUDGE_ROUND_READY'
        } catch {
          return false
        }
      }

      const notificationHandler = (event) => {
        console.log('[SSE] Notification received:', event.data)
        // Служебные события — без toast/звука
        if (isSilentNotification(event.data)) {
          emitEvent('notification', { message: event.data, toastId: null })
          return
        }
        const toastId = showNotification(event.data)
        // Используем функцию для определения типа звука по сообщению
        playSoundForNotification(event.data)
        emitEvent('notification', { message: event.data, toastId })
      }
      
      state.connection.addEventListener('notification', notificationHandler)
      
      // Сохраняем ссылку на обработчик для очистки
      state._notificationHandler = notificationHandler
    }

    // Отключение от SSE
    const disconnect = () => {
      if (state.connection) {
        console.log('[SSE] Disconnecting...')
        
        // Удаляем обработчик
        if (state._notificationHandler) {
          state.connection.removeEventListener('notification', state._notificationHandler)
          state._notificationHandler = null
        }
        
        // Закрываем соединение
        state.connection.close()
        state.connection = null
        state.connected = false
        
        // Очищаем таймер переподключения
        if (state.reconnectTimer) {
          clearTimeout(state.reconnectTimer)
          state.reconnectTimer = null
        }
        
        console.log('[SSE] Disconnected')
        emitEvent('disconnected')
      }
      
      closeAllToasts()
    }

    // Инициализация
    const initialize = () => {
      console.log('[SSE] Initializing...')
      loadSoundSettings()
      setupAudioActivation()
      
      // Автоподключение при инициализации
      if (config.autoConnect && !state.isDestroyed) {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          // Если пользователь уже авторизован, подключаемся
          setTimeout(() => connect(), 1000)
        }
      }
    }

    // Публичное API
    const sseApi = {
      // Состояние
      get connected() {
        return state.connected
      },
      
      get soundEnabled() {
        return state.soundEnabled
      },
      
      set soundEnabled(value) {
        state.soundEnabled = value
        saveSoundSettings()
      },
      
      get soundVolume() {
        return state.soundVolume
      },
      
      set soundVolume(value) {
        state.soundVolume = Math.max(0, Math.min(1, value))
        saveSoundSettings()
      },
      
      // Методы
      connect,
      disconnect,
      on,
      off,
      showNotification,
      closeAllToasts,
      toggleSound: () => {
        state.soundEnabled = !state.soundEnabled
        saveSoundSettings()
        return state.soundEnabled
      },
      
      setSoundVolume: (volume) => {
        state.soundVolume = Math.max(0, Math.min(1, volume))
        saveSoundSettings()
      },
      
      setToastAutoCloseTime: (timeInMs) => {
        state.toastAutoCloseTime = timeInMs
      },
      
      // Информация о конфигурации
      getConfig: () => ({
        baseUrl: config.baseUrl,
        endpoint: config.endpoint,
        isUsingEnv: !!import.meta.env.VITE_API_BASE_URL
      }),
      
      // Очистка
      destroy: () => {
        state.isDestroyed = true
        disconnect()
        state.eventHandlers.clear()
        console.log('[SSE] Destroyed')
      }
    }

    // Инициализируем
    initialize()

    // Делаем доступным глобально
    app.config.globalProperties.$sse = sseApi
    app.provide('sse', sseApi)
    
    // Также доступно через window для отладки
    window.$sse = sseApi
    
    console.log('[SSE Plugin] Initialized with URL:', config.baseUrl)

    // plugins/ssePlugin.js - добавьте в конец install метода

    // Автоматическое отключение при закрытии вкладки
    const beforeUnloadHandler = () => {
        console.log('[SSE] Page unloading, disconnecting...')
        sseApi.disconnect()
    }

    // Для разработки: слушаем событие beforeunload
    if (import.meta.env.DEV) {
        window.addEventListener('beforeunload', beforeUnloadHandler)
        window.addEventListener('pagehide', beforeUnloadHandler)
    }

    // Очистка при уничтожении приложения
    app.mixin({
        beforeUnmount() {
            // Отключаем SSE при размонтировании корневого компонента
            if (this.$root === this && window.$sse) {
            console.log('[SSE] App unmounting, disconnecting...')
            window.$sse.disconnect()
            // Убираем обработчики событий
            window.removeEventListener('beforeunload', beforeUnloadHandler)
            window.removeEventListener('pagehide', beforeUnloadHandler)
            }
        }
    })
  }
}

export default SSEPlugin