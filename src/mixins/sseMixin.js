// src/mixins/sseMixin.js
export default {
  data() {
    return {
      sseConnection: null,
      sseConnected: false,
      audioContext: null,
      soundEnabled: true,
      soundVolume: 1,
      toastAutoCloseTime: 1000, // Срок жизни уведомления до автоматического закрытия (30 секунд)
      activeToasts: new Map() // Для хранения активных toast-уведомлений
    }
  },
  
  mounted() {
    // Загружаем настройки звука
    this.loadSoundSettings()
    
    // Создаем обработчик для инициализации AudioContext при клике
    this.setupAudioActivation()
  },
  
  methods: {
    setupAudioActivation() {
      // AudioContext можно создать только после пользовательского взаимодействия
      // Вешаем обработчик на весь документ
      const activateAudio = () => {
        if (!this.audioContext) {
          try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            console.log('AudioContext created after user interaction')
            
            // Проигрываем тестовый звук для проверки
            this.playTestSound()
          } catch (error) {
            console.log('Failed to create AudioContext:', error)
          }
          
          // Удаляем обработчик после первого клика
          document.removeEventListener('click', activateAudio)
          document.removeEventListener('keydown', activateAudio)
          document.removeEventListener('touchstart', activateAudio)
        }
      }
      
      // Вешаем на разные события для надежности
      document.addEventListener('click', activateAudio)
      document.addEventListener('keydown', activateAudio)
      document.addEventListener('touchstart', activateAudio)
    },
    
    loadSoundSettings() {
      const saved = localStorage.getItem('notificationSoundSettings')
      if (saved) {
        try {
          const settings = JSON.parse(saved)
          this.soundEnabled = settings.enabled !== undefined ? settings.enabled : true
          this.soundVolume = settings.volume || 0.3
          // Можно также загружать toastAutoCloseTime если нужно сохранять его
          // this.toastAutoCloseTime = settings.toastAutoCloseTime || 10000
        } catch (error) {
          console.log('Failed to load sound settings:', error)
        }
      }
    },
    
    saveSoundSettings() {
      const settings = {
        enabled: this.soundEnabled,
        volume: this.soundVolume
        // Можно также сохранять toastAutoCloseTime если нужно
        // toastAutoCloseTime: this.toastAutoCloseTime
      }
      localStorage.setItem('notificationSoundSettings', JSON.stringify(settings))
    },
    
    connectToSSE(endpoint = '/notifications/stream') {
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      const url = `${baseUrl}${endpoint}`
      
      this.sseConnection = new EventSource(url, { withCredentials: true })
      
      this.sseConnection.onopen = () => {
        this.sseConnected = true
        console.log('SSE connection established')
        this.$emit('sse-connected')
      }
      
      this.sseConnection.onerror = (error) => {
        console.error('SSE error:', error)
        this.sseConnected = false
        this.$emit('sse-error', error)
      }
      
      // Обработка уведомлений
      this.sseConnection.addEventListener('notification', (event) => {
        console.log('SSE notification event:', event.data)
        
        // 1. Показываем уведомление
        const toastId = this.showNotification(event.data)
        
        // 2. Проигрываем звук
        this.playNotificationSound()
        
        // 3. Отправляем событие
        this.$emit('sse-notification', {
          message: event.data,
          toastId: toastId
        })
      })
      
      return this.sseConnection
    },
    
    disconnectSSE() {
      if (this.sseConnection) {
        this.sseConnection.close()
        this.sseConnection = null
        this.sseConnected = false
        console.log('SSE disconnected')
        this.$emit('sse-disconnected')
        
        // Закрываем все активные уведомления
        this.closeAllToasts()
      }
    },
    
    onSSEEvent(eventName, callback) {
      if (this.sseConnection) {
        this.sseConnection.addEventListener(eventName, callback)
      }
    },
    
    showNotification(message) {
      console.log('Notification:', message)
      
      // Генерируем уникальный ID для toast
      const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      
      // Создаем toast элемент
      const toast = document.createElement('div')
      toast.id = toastId
      toast.className = 'notification-toast'
      
      // Форматируем время
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      // Содержимое toast с кнопкой закрытия
      toast.innerHTML = `
        <div class="toast-content">
          <div class="toast-header">
            <span class="toast-icon">🔔</span>
            <span class="toast-time">${time}</span>
            <button class="toast-close" aria-label="Закрыть">&times;</button>
          </div>
          <div class="toast-message">${this.escapeHtml(message)}</div>
        </div>
      `
      
      // Стили для toast
      const style = document.createElement('style')
      style.textContent = this.getToastStyles()
      toast.appendChild(style)
      
      // Добавляем в DOM
      document.body.appendChild(toast)
      
      // Сохраняем ссылку на toast
      this.activeToasts.set(toastId, toast)
      
      // Назначаем обработчик закрытия
      const closeBtn = toast.querySelector('.toast-close')
      closeBtn.addEventListener('click', () => {
        this.closeToast(toastId)
      })
      
      // Закрытие по клику на само уведомление (опционально)
      toast.addEventListener('click', (e) => {
        if (!e.target.closest('.toast-close')) {
          // Можно добавить дополнительное действие при клике на уведомление
          console.log('Toast clicked:', message)
        }
      })
      
      // Автоматическое закрытие через заданное время (по умолчанию 10 секунд)
      const autoCloseTimer = setTimeout(() => {
        this.closeToast(toastId)
      }, this.toastAutoCloseTime)
      
      // Сохраняем таймер для возможности отмены
      toast._autoCloseTimer = autoCloseTimer
      
      return toastId
    },
    
    closeToast(toastId) {
      const toast = this.activeToasts.get(toastId)
      if (!toast) return
      
      // Отменяем авто-закрытие
      if (toast._autoCloseTimer) {
        clearTimeout(toast._autoCloseTimer)
      }
      
      // Анимация закрытия
      toast.style.animation = 'toastSlideOut 0.3s ease-out'
      
      // Удаляем через время анимации
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
        this.activeToasts.delete(toastId)
        
        // Событие о закрытии
        this.$emit('toast-closed', toastId)
      }, 300)
    },
    
    closeAllToasts() {
      // Закрываем все активные уведомления
      for (const [toastId] of this.activeToasts) {
        this.closeToast(toastId)
      }
      this.activeToasts.clear()
    },
    
    getToastStyles() {
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
        
        .toast-content {
          padding: 15px;
        }
        
        .toast-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .toast-icon {
          font-size: 16px;
        }
        
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
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes toastSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        /* Стиль для нескольких уведомлений - смещение */
        .notification-toast ~ .notification-toast {
          top: 90px;
        }
        
        .notification-toast ~ .notification-toast ~ .notification-toast {
          top: 160px;
        }
        
        .notification-toast ~ .notification-toast ~ .notification-toast ~ .notification-toast {
          top: 230px;
        }
      `
    },
    
    escapeHtml(text) {
      if (text == null) return ''
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    },
    
    playNotificationSound(type = 'default') {
      if (!this.soundEnabled) {
        console.log('Sound disabled by user')
        return
      }
      
      // Если AudioContext еще не создан, используем fallback звук
      if (!this.audioContext) {
        console.log('AudioContext not ready, using simple beep')
        this.playSimpleBeep()
        return
      }
      
      // Проверяем состояние AudioContext
      if (this.audioContext.state === 'suspended') {
        console.log('AudioContext suspended, trying to resume...')
        this.audioContext.resume().then(() => {
          this.playWebAudioSound(type)
        }).catch(error => {
          console.log('Failed to resume AudioContext:', error)
          this.playSimpleBeep()
        })
      } else {
        this.playWebAudioSound(type)
      }
    },
    
    playWebAudioSound(type) {
      try {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        // Настройки звука
        const settings = this.getSoundSettings(type)
        
        oscillator.frequency.value = settings.frequency
        oscillator.type = settings.waveType
        
        // Плавное нарастание и затухание
        const now = this.audioContext.currentTime
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(this.soundVolume, now + settings.attack)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + settings.duration)
        
        oscillator.start(now)
        oscillator.stop(now + settings.duration)
        
        console.log('Web Audio sound played')
        
      } catch (error) {
        console.log('Web Audio API failed:', error)
        this.playSimpleBeep()
      }
    },
    
    playSimpleBeep() {
      try {
        // Самый простой способ - создать короткий beep через HTML Audio
        const audio = new Audio()
        
        // Создаем очень короткий beep (1ms)
        const duration = 0.1
        const sampleRate = 8000
        const samples = Math.round(sampleRate * duration)
        
        // Создаем WAV файл в памяти
        const buffer = new ArrayBuffer(44 + samples * 2)
        const view = new DataView(buffer)
        
        // Заголовок WAV
        this.writeString(view, 0, 'RIFF')
        view.setUint32(4, 36 + samples * 2, true)
        this.writeString(view, 8, 'WAVE')
        this.writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, 1, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, sampleRate * 2, true)
        view.setUint16(32, 2, true)
        view.setUint16(34, 16, true)
        this.writeString(view, 36, 'data')
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
        audio.volume = this.soundVolume
        
        audio.play().then(() => {
          // Освобождаем память
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }).catch(error => {
          console.log('Simple beep failed:', error)
          URL.revokeObjectURL(url)
        })
        
      } catch (error) {
        console.log('All sound methods failed:', error)
      }
    },
    
    writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    },
    
    getSoundSettings(type) {
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
    },
    
    playSoundForNotification(message) {
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
      
      this.playNotificationSound(soundType)
    },
    
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.saveSoundSettings()
      
      if (this.soundEnabled) {
        this.playTestSound()
      }
      
      return this.soundEnabled
    },
    
    setSoundVolume(volume) {
      this.soundVolume = Math.max(0, Math.min(1, volume))
      this.saveSoundSettings()
    },
    
    setToastAutoCloseTime(timeInMs) {
      this.toastAutoCloseTime = timeInMs
      // Можно также сохранять в localStorage если нужно:
      // this.saveSoundSettings()
    },
    
    playTestSound() {
      if (this.soundEnabled) {
        console.log('Playing test sound...')
        this.playNotificationSound('default')
      }
    },
    
    beforeDestroy() {
      this.disconnectSSE()
      this.closeAllToasts()
    }
  }
}