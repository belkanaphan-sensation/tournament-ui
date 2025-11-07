<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner">
      <!-- Простая CSS иконка загрузки -->
      <div class="spinner"></div>
      <!-- Или можно использовать SVG или другую иконку -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingOverlay',
  props: {
    isLoading: {
      type: Boolean,
      required: true,
      default: false
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Серый прозрачный фон */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Высокий z-index чтобы быть поверх всего */
  cursor: wait; /* Курсор "ожидание" */
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>