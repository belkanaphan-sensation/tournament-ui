<template>
  <!-- Модальное окно с игрой -->
  <div v-if="isOpen" class="snake-modal-overlay" @click="close">
    <div class="snake-modal-content" @click.stop>
      <!-- Заголовок -->
      <div class="snake-modal-header">
        <h2>Змейка</h2>
        <button @click="close" class="snake-close-btn">×</button>
      </div>

      <!-- Игровая информация -->
      <div class="snake-game-info">
        <div class="snake-info-item">Счёт: {{ score }}</div>
        <div class="snake-info-item">Уровень: {{ level }}</div>
      </div>

      <!-- Игровое поле -->
      <div class="snake-game-container">
        <div 
          class="snake-game-board" 
          :style="boardStyle"
        >
          <!-- Еда -->
          <div 
            v-if="food"
            class="snake-cell snake-food"
            :style="getCellStyle(food)"
          ></div>

          <!-- Змейка -->
          <div
            v-for="(segment, index) in snake"
            :key="index"
            class="snake-cell"
            :class="{
              'snake-head': index === 0,
              'snake-body': index > 0
            }"
            :style="getCellStyle(segment)"
          ></div>
        </div>
      </div>

      <!-- Управление -->
      <div class="snake-controls">
        <div class="snake-control-row">
          <button @click="changeDirection('up')" class="snake-control-btn up">↑</button>
        </div>
        <div class="snake-control-row">
          <button @click="changeDirection('left')" class="snake-control-btn left">←</button>
          <button @click="toggleGame" class="snake-control-btn play-pause">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <button @click="changeDirection('right')" class="snake-control-btn right">→</button>
        </div>
        <div class="snake-control-row">
          <button @click="changeDirection('down')" class="snake-control-btn down">↓</button>
        </div>
      </div>

      <!-- Кнопки игры -->
      <div class="snake-game-buttons">
        <button @click="toggleGame" class="snake-game-btn">
          {{ isPlaying ? 'Пауза' : 'Старт' }}
        </button>
        <button @click="resetGame" class="snake-game-btn">Новая игра</button>
      </div>

      <!-- Game Over -->
      <div v-if="gameOver" class="snake-game-over">
        <h3>Игра окончена!</h3>
        <p>Счёт: {{ score }}</p>
        <button @click="resetGame" class="snake-game-btn">Играть снова</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MobileSnakeGame',
  props: {
    isOpen: Boolean
  },
  emits: ['close'],
  setup(props, { emit }) {
    // Константы игры
    const boardSize = 15
    const initialSpeed = 200
    
    // Состояние игры
    const snake = ref([{ x: 7, y: 7 }])
    const food = ref(null)
    const direction = ref('right')
    const nextDirection = ref('right')
    const isPlaying = ref(false)
    const gameOver = ref(false)
    const score = ref(0)
    const level = ref(1)
    const gameInterval = ref(null)

    // Computed
    const boardStyle = computed(() => ({
      gridTemplateColumns: `repeat(${boardSize}, 20px)`,
      gridTemplateRows: `repeat(${boardSize}, 20px)`
    }))

    // Методы
    const close = () => {
      emit('close')
      resetGame()
    }

    const createFood = () => {
      let newFood
      do {
        newFood = {
          x: Math.floor(Math.random() * boardSize),
          y: Math.floor(Math.random() * boardSize)
        }
      } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y))
      
      food.value = newFood
    }

    const getCellStyle = (cell) => ({
      gridColumn: cell.x + 1,
      gridRow: cell.y + 1
    })

    const changeDirection = (newDirection) => {
      if (gameOver.value) return

      if (
        (newDirection === 'up' && direction.value !== 'down') ||
        (newDirection === 'down' && direction.value !== 'up') ||
        (newDirection === 'left' && direction.value !== 'right') ||
        (newDirection === 'right' && direction.value !== 'left')
      ) {
        nextDirection.value = newDirection
      }

      if (!isPlaying.value && !gameOver.value) {
        isPlaying.value = true
        startGame()
      }
    }

    const moveSnake = () => {
      if (!isPlaying.value || gameOver.value) return

      direction.value = nextDirection.value
      const head = { ...snake.value[0] }

      switch (direction.value) {
        case 'up': head.y -= 1; break
        case 'down': head.y += 1; break
        case 'left': head.x -= 1; break
        case 'right': head.x += 1; break
      }

      // Проверка столкновений
      if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize ||
          snake.value.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame()
        return
      }

      snake.value.unshift(head)

      // Съедание еды
      if (food.value && head.x === food.value.x && head.y === food.value.y) {
        score.value += 10
        createFood()
        level.value = Math.floor(score.value / 50) + 1
        if (gameInterval.value) {
          clearInterval(gameInterval.value)
          startGame()
        }
      } else {
        snake.value.pop()
      }
    }

    const toggleGame = () => {
      if (gameOver.value) {
        resetGame()
        return
      }
      isPlaying.value = !isPlaying.value
      if (isPlaying.value) startGame()
      else clearInterval(gameInterval.value)
    }

    const startGame = () => {
      if (gameInterval.value) clearInterval(gameInterval.value)
      const speed = Math.max(100, initialSpeed - (level.value - 1) * 15)
      gameInterval.value = setInterval(moveSnake, speed)
    }

    const endGame = () => {
      gameOver.value = true
      isPlaying.value = false
      clearInterval(gameInterval.value)
    }

    const resetGame = () => {
      clearInterval(gameInterval.value)
      snake.value = [{ x: 7, y: 7 }]
      direction.value = 'right'
      nextDirection.value = 'right'
      isPlaying.value = false
      gameOver.value = false
      score.value = 0
      level.value = 1
      createFood()
    }

    // Обработка клавиатуры
    const handleKeyDown = (event) => {
      if (!props.isOpen || gameOver.value) return
      switch (event.key) {
        case 'ArrowUp': event.preventDefault(); changeDirection('up'); break
        case 'ArrowDown': event.preventDefault(); changeDirection('down'); break
        case 'ArrowLeft': event.preventDefault(); changeDirection('left'); break
        case 'ArrowRight': event.preventDefault(); changeDirection('right'); break
        case ' ': event.preventDefault(); toggleGame(); break
        case 'Escape': event.preventDefault(); close(); break
      }
    }

    // Хуки
    onMounted(() => {
      createFood()
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      clearInterval(gameInterval.value)
      window.removeEventListener('keydown', handleKeyDown)
    })

    return {
      snake,
      food,
      isPlaying,
      gameOver,
      score,
      level,
      boardStyle,
      close,
      changeDirection,
      toggleGame,
      resetGame,
      getCellStyle
    }
  }
}
</script>

<style scoped>
.snake-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.snake-modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.snake-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.snake-modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.snake-close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.snake-close-btn:active {
  background: #f0f0f0;
}

.snake-game-info {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.snake-info-item {
  font-weight: bold;
  color: #2c3e50;
  font-size: 14px;
}

.snake-game-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.snake-game-board {
  display: grid;
  gap: 1px;
  background: #34495e;
  border: 3px solid #2c3e50;
  border-radius: 10px;
  padding: 3px;
}

.snake-cell {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

.snake-food {
  background: #e74c3c;
  animation: pulse 1s infinite;
  border-radius: 50%;
}

.snake-head {
  background: #27ae60;
  border-radius: 4px;
}

.snake-body {
  background: #2ecc71;
  border-radius: 2px;
}

.snake-controls {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
  margin: 0 20px 20px;
}

.snake-control-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.snake-control-btn {
  background: #3498db;
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  margin: 0 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.1s;
}

.snake-control-btn:active {
  transform: scale(0.9);
}

.snake-control-btn.up { background: #27ae60; }
.snake-control-btn.down { background: #e67e22; }
.snake-control-btn.left { background: #3498db; }
.snake-control-btn.right { background: #9b59b6; }
.snake-control-btn.play-pause { 
  background: #2c3e50; 
  width: 70px;
  height: 70px;
}

.snake-game-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 0 20px 20px;
}

.snake-game-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
  max-width: 150px;
}

.snake-game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.snake-game-over h3 {
  color: #e74c3c;
  margin: 0 0 15px 0;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>