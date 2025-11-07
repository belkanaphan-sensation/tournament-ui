<template>
  <div class="control-panel">
    <button class="control-button back-button" aria-label="Назад" @click="$emit('back')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="button-text">Назад</span>
    </button>
    
    <button class="control-button refresh-button" aria-label="Обновить" @click="$emit('refresh')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1 20V14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="button-text">Обновить</span>
    </button>
  </div>
</template>

<script>

export default {
  name: 'ControlPanel',
  emits: ['back'],

}
</script>

<style scoped>
.control-panel {
  display: flex;
  gap: 12px;
  align-items: center;
}

.control-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  overflow: hidden;
}

.control-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s ease;
}

.control-button:hover::before {
  left: 100%;
}

.control-button svg {
  transition: transform 0.3s ease;
}

.button-text {
  transition: transform 0.3s ease;
}

/* Кнопка "Назад" */
.back-button {
  border-color: #6c757d;
  color: #6c757d;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.back-button:hover {
  border-color: #495057;
  color: #495057;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.2);
}

.back-button:hover svg {
  transform: translateX(-2px);
}

.back-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(108, 117, 125, 0.2);
}

/* Кнопка "Обновить" */
.refresh-button {
  border-color: #007bff;
  color: #007bff;
  background: linear-gradient(135deg, #f0f8ff, #e3f2fd);
}

.refresh-button:hover {
  border-color: #0056b3;
  color: #0056b3;
  background: linear-gradient(135deg, #ffffff, #f0f8ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.2);
}

.refresh-button:hover svg {
  transform: rotate(45deg);
}

.refresh-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.2);
}

.refresh-button:active svg {
  transform: rotate(90deg);
}

/* Анимация вращения при клике */
.refresh-button.loading svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Анимация появления */
.control-panel {
  animation: panelAppear 0.5s ease-out;
}

@keyframes panelAppear {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Состояние disabled */
.control-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.control-button:disabled:hover {
  box-shadow: none;
  transform: none;
}

.control-button:disabled svg {
  transform: none !important;
  animation: none !important;
}

/* Адаптивность */
@media (max-width: 768px) {
  .control-panel {
    gap: 10px;
  }
  
  .control-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .control-button svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .control-panel {
    gap: 8px;
  }
  
  .control-button {
    padding: 8px 12px;
    font-size: 0.85rem;
    gap: 6px;
  }
  
  .button-text {
    display: none;
  }
  
  .control-button {
    padding: 10px;
    border-radius: 8px;
  }
  
  .control-button svg {
    width: 16px;
    height: 16px;
    margin: 0;
  }
}

/* Компактный вариант */
.control-panel.compact .control-button {
  padding: 8px 12px;
  font-size: 0.85rem;
}

.control-panel.compact .button-text {
  font-size: 0.8rem;
}

/* Темная тема поддержка */
@media (prefers-color-scheme: dark) {
  .control-button {
    background: #2d3748;
  }
  
  .back-button {
    border-color: #718096;
    color: #718096;
    background: linear-gradient(135deg, #4a5568, #2d3748);
  }
  
  .back-button:hover {
    border-color: #cbd5e0;
    color: #cbd5e0;
    background: linear-gradient(135deg, #718096, #4a5568);
  }
  
  .refresh-button {
    border-color: #63b3ed;
    color: #63b3ed;
    background: linear-gradient(135deg, #2a4365, #1a365d);
  }
  
  .refresh-button:hover {
    border-color: #90cdf4;
    color: #90cdf4;
    background: linear-gradient(135deg, #3182ce, #2a4365);
  }
}
</style>