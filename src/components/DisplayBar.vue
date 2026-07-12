<template>
  <div class="field-container">
    <label class="field-label">{{ label }}:</label>
    <div class="display-bar">
      <span
        v-for="item in sortedItems"
        :key="item.orderNumber"
        class="display-square"
        :class="item.value ? 'is-active' : 'is-inactive'"
        :title="`Порядковый номер раунда: ${item.orderNumber}`"
      ></span>
      <span v-if="sortedItems.length === 0" class="display-empty">Нет данных</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DisplayBar',
  props: {
    label: {
      type: String,
      default: ''
    },
    displayRoundStates: {
      type: [Object, Map],
      default: () => ({})
    }
  },

  computed: {
    sortedItems() {
      const entries = this.displayRoundStates instanceof Map
        ? [...this.displayRoundStates.entries()]
        : Object.entries(this.displayRoundStates || {});

      return entries
        .map(([orderNumber, value]) => ({
          orderNumber: Number(orderNumber),
          value: Boolean(value)
        }))
        .sort((a, b) => a.orderNumber - b.orderNumber);
    }
  }
}
</script>

<style scoped>
.field-container {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: fieldAppear 0.5s ease-out;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.display-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 1.4rem;
}

.display-square {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.display-square.is-inactive {
  background: #bdbdbd;
}

.display-square.is-active {
  background: #4caf50;
}

.display-empty {
  color: #6c757d;
  font-size: 1.1rem;
  font-weight: 500;
  font-style: italic;
}

@keyframes fieldAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .field-container {
    padding: 16px;
    border-radius: 10px;
  }

  .field-label {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
}

@media (max-width: 480px) {
  .field-container {
    padding: 14px;
    border-radius: 8px;
  }

  .field-label {
    font-size: 0.85rem;
  }

  .display-square {
    width: 14px;
    height: 14px;
  }
}
</style>
