<template>
  <div class="performance-rating-container">
    <div 
      v-for="performance in performances" 
      :key="performance.id" 
      class="performance-group"
    >
      <!-- Заголовок группы выступления -->
      <div class="performance-header" @click="togglePerformance(performance.id)">
        <div class="header-content">
          <span class="performance-title">Оценка №{{ performance.number }}</span>
          <span class="collapse-icon">
            {{ performance.isCollapsed ? '▶' : '▼' }}
          </span>
        </div>
        <div class="performance-info">
          <small>Дата: {{ performance.date }} • Оценок: {{ getSelectedCount(performance) }}/{{ performance.categories.length }}</small>
        </div>
      </div>

      <!-- Содержимое группы - все категории оценки -->
      <div v-if="!performance.isCollapsed" class="performance-content">
        <div 
          v-for="(category, catIndex) in performance.categories" 
          :key="category.id" 
          class="category-group"
        >
          <!-- Название категории -->
          <div class="category-label">
            {{ category.label }}
          </div>
          
          <!-- Кнопки оценки от 1 до 10 -->
          <div class="buttons-row">
            <button
              v-for="number in 10"
              :key="number"
              :class="[
                'rating-button',
                { 
                  'active': number <= category.value,
                  'selected': number === category.value 
                }
              ]"
              @click="setRating(performance.id, catIndex, number)"
              type="button"
            >
              {{ number }}
            </button>
          </div>
        </div>

        <!-- Итоговая информация по выступлению -->
        <div class="performance-summary">
          <div class="summary-item">
            <strong>Средний балл:</strong> {{ calculateAverage(performance) }}
          </div>
          <div class="summary-item">
            <strong>Общий балл:</strong> {{ calculateTotal(performance) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Управление группами -->
    <div class="controls">
      <button @click="collapseAll">Свернуть все</button>
      <button @click="expandAll">Развернуть все</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PerformanceRatingGroups',
  props: {
    initialPerformances: {
      type: Array,
      default: () => []
    },
    availableCategories: {
      type: Array,
      default: () => [
        'Музыкальность', 
        'Техника', 
        'Артистизм', 
        'Внешний вид',
        'Сложность программы',
        'Художественный образ'
      ]
    }
  },
  data() {
    return {
      performances: [],
      nextPerformanceNumber: 1
    }
  },
  created() {
    this.initializePerformances();
  },
  methods: {
    initializePerformances() {
      if (this.initialPerformances.length > 0) {
        this.performances = this.initialPerformances;
        this.nextPerformanceNumber = Math.max(...this.initialPerformances.map(p => p.number)) + 1;
      }
    },

    createPerformance(number) {
      return {
        id: this.generateId(),
        number: number,
        date: new Date().toLocaleDateString('ru-RU'),
        isCollapsed: false,
        categories: this.availableCategories.map(label => ({
          id: this.generateId(),
          label: label,
          value: null
        }))
      };
    },

    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    togglePerformance(performanceId) {
      const performance = this.performances.find(p => p.id === performanceId);
      if (performance) {
        performance.isCollapsed = !performance.isCollapsed;
      }
    },

    setRating(performanceId, categoryIndex, value) {
      const performance = this.performances.find(p => p.id === performanceId);
      if (performance && performance.categories[categoryIndex]) {
        performance.categories[categoryIndex].value = value;
        
        this.$emit('rating-change', {
          performanceId: performanceId,
          performanceNumber: performance.number,
          category: performance.categories[categoryIndex].label,
          value: value
        });
      }
    },

    getSelectedCount(performance) {
      return performance.categories.filter(cat => cat.value !== null).length;
    },

    calculateAverage(performance) {
      const values = performance.categories
        .map(cat => cat.value)
        .filter(value => value !== null);
      
      if (values.length === 0) return 0;
      
      const sum = values.reduce((total, value) => total + value, 0);
      return (sum / values.length).toFixed(1);
    },

    calculateTotal(performance) {
      return performance.categories
        .map(cat => cat.value || 0)
        .reduce((total, value) => total + value, 0);
    },

    collapseAll() {
      this.performances.forEach(performance => {
        performance.isCollapsed = true;
      });
    },

    expandAll() {
      this.performances.forEach(performance => {
        performance.isCollapsed = false;
      });
    }
  },

  watch: {
    initialPerformances: {
      handler(newPerformances) {
        if (newPerformances.length > 0) {
          this.performances = newPerformances;
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.performance-rating-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.performance-group {
  border: 2px solid #e3f2fd;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  overflow: hidden;
  transition: all 0.3s ease;
}

.performance-group:hover {
  border-color: #bbdefb;
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
}

.performance-header {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  padding: 20px;
  cursor: pointer;
  user-select: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.performance-title {
  font-weight: 700;
  font-size: 18px;
}

.collapse-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.performance-info {
  opacity: 0.9;
  font-size: 13px;
}

.performance-content {
  padding: 24px;
}

.category-group {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: white;
}

.category-group:last-child {
  margin-bottom: 0;
}

.category-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.buttons-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.rating-button {
  width: 36px;
  height: 36px;
  border: 2px solid #2196f3;
  border-radius: 8px;
  background-color: white;
  color: #2196f3;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-button:hover {
  background-color: #e3f2fd;
  transform: translateY(-1px);
}

.rating-button.active {
  background-color: #2196f3;
  color: white;
  border-color: #1976d2;
}

.rating-button.selected {
  background-color: #1976d2;
  border-color: #0d47a1;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.selected-info {
  text-align: center;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.performance-summary {
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.summary-item {
  text-align: center;
  font-size: 14px;
}

.summary-item strong {
  color: #1976d2;
}

.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.controls button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.controls button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

/* Адаптивность */
@media (max-width: 768px) {
  .performance-rating-container {
    padding: 12px;
  }
  
  .performance-header {
    padding: 16px;
  }
  
  .performance-content {
    padding: 16px;
  }
  
  .performance-summary {
    flex-direction: column;
    gap: 12px;
  }
  
  .rating-button {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .performance-title {
    font-size: 16px;
  }
}
</style>