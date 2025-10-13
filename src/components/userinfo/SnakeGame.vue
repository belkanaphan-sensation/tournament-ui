<template>
  <!-- Модальное окно змейки -->
  <div v-if="showSnakeGame" class="snake-modal-overlay">
    <div class="snake-modal-content">
      <div class="snake-modal-header">
        <h2>🎮 Змейка</h2>
        <button @click="closeGame" class="close-btn">✕</button>
      </div>
      
      <div class="game-area">
        <!-- Игровая информация -->
        <div class="game-info">
          <span>Счёт: {{ score }}</span>
          <span>Уровень: {{ level }}</span>
          <span>Длина: {{ snake.length }}</span>
        </div>
        
        <!-- Игровое поле -->
        <div class="game-board" 
             :style="{
               gridTemplateColumns: `repeat(${boardSize}, 25px)`,
               gridTemplateRows: `repeat(${boardSize}, 25px)`
             }">
          <!-- Еда -->
          <div 
            v-if="food"
            class="cell food"
            :style="{
              gridColumn: food.x + 1,
              gridRow: food.y + 1
            }"
          >🍎</div>

          <!-- Змейка -->
          <div
            v-for="(segment, index) in snake"
            :key="index"
            class="cell snake"
            :class="{
              'snake-head': index === 0,
              'snake-body': index > 0
            }"
            :style="{
              gridColumn: segment.x + 1,
              gridRow: segment.y + 1
            }"
          >
            <span v-if="index === 0">🐍</span>
            <span v-else>🟢</span>
          </div>
        </div>

        <!-- Мобильное управление -->
        <div class="mobile-controls">
          <div class="control-row">
            <button @click="changeDirection('up')" class="control-btn up">↑</button>
          </div>
          <div class="control-row">
            <button @click="changeDirection('left')" class="control-btn left">←</button>
            <button @click="toggleGame" class="control-btn play-pause">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button @click="changeDirection('right')" class="control-btn right">→</button>
          </div>
          <div class="control-row">
            <button @click="changeDirection('down')" class="control-btn down">↓</button>
          </div>
        </div>

        <!-- Кнопки управления -->
        <div class="game-controls">
          <button @click="toggleGame" class="game-btn">
            {{ isPlaying ? 'Пауза' : 'Старт' }}
          </button>
          <button @click="resetGame" class="game-btn">Новая игра</button>
        </div>

        <!-- Game Over экран -->
        <div v-if="gameOver" class="game-over-overlay">
          <div class="game-over-content">
            <h3>Игра окончена! 🎯</h3>
            <p>Ваш счёт: {{ score }}</p>
            <p>Длина змейки: {{ snake.length }}</p>
            <button @click="resetGame" class="game-btn play-again">Играть снова</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'SnakeGame',
  
  props: {
    showSnakeGame: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close'],

  setup(props, { emit }) {
    const boardSize = ref(12)
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

    // Создание еды
    const createFood = () => {
      let newFood
      do {
        newFood = {
          x: Math.floor(Math.random() * boardSize.value),
          y: Math.floor(Math.random() * boardSize.value)
        }
      } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y))
      
      food.value = newFood
    }

    // Изменение направления
    const changeDirection = (newDirection) => {
      if (gameOver.value) return

      // Запрещаем движение в противоположном направлении
      if (
        (newDirection === 'up' && direction.value !== 'down') ||
        (newDirection === 'down' && direction.value !== 'up') ||
        (newDirection === 'left' && direction.value !== 'right') ||
        (newDirection === 'right' && direction.value !== 'left')
      ) {
        nextDirection.value = newDirection
      }

      // Автоматически запускаем игру при нажатии кнопки управления
      if (!isPlaying.value && !gameOver.value) {
        isPlaying.value = true
        startGame()
      }
    }

    // Движение змейки - ИСПРАВЛЕННАЯ ВЕРСИЯ
    const moveSnake = () => {
      if (!isPlaying.value || gameOver.value) return

      direction.value = nextDirection.value

      const head = { ...snake.value[0] }

      switch (direction.value) {
        case 'up':
          head.y -= 1
          break
        case 'down':
          head.y += 1
          break
        case 'left':
          head.x -= 1
          break
        case 'right':
          head.x += 1
          break
      }

      // ПРОВЕРКА ГРАНИЦ - ТЕПЕРЬ ПРАВИЛЬНО
      // boardSize = 15, значит допустимые координаты: 0-14
      if (head.x < 0 || head.x >= boardSize.value || 
          head.y < 0 || head.y >= boardSize.value) {
        console.log('Столкновение со стеной!', { 
          x: head.x, 
          y: head.y, 
          boardSize: boardSize.value,
          snakeHead: snake.value[0]
        })
        endGame()
        return
      }

      // Проверка столкновения с собой
      const bodyCollision = snake.value.slice(1).some(segment => 
        segment.x === head.x && segment.y === head.y
      )
      
      if (bodyCollision) {
        console.log('Столкновение с собой!')
        endGame()
        return
      }

      // Добавляем новую голову
      snake.value.unshift(head)

      // Проверка съедания еды
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

    // Запуск/пауза игры
    const toggleGame = () => {
      if (gameOver.value) {
        resetGame()
        return
      }
      
      isPlaying.value = !isPlaying.value
      
      if (isPlaying.value) {
        startGame()
      } else {
        clearInterval(gameInterval.value)
      }
    }

    // Начало игры
    const startGame = () => {
      if (gameInterval.value) {
        clearInterval(gameInterval.value)
      }
      
      const speed = Math.max(100, initialSpeed - (level.value - 1) * 15)
      gameInterval.value = setInterval(moveSnake, speed)
    }

    // Конец игры
    const endGame = () => {
      gameOver.value = true
      isPlaying.value = false
      clearInterval(gameInterval.value)
    }

    // Сброс игры
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

    // Закрытие игры
    const closeGame = () => {
      emit('close')
      isPlaying.value = false
      clearInterval(gameInterval.value)
    }

    // Обработка клавиатуры
    const handleKeyDown = (event) => {
      if (!props.showSnakeGame || gameOver.value) return

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          changeDirection('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          changeDirection('down')
          break
        case 'ArrowLeft':
          event.preventDefault()
          changeDirection('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          changeDirection('right')
          break
        case ' ':
          event.preventDefault()
          toggleGame()
          break
        case 'Escape':
          event.preventDefault()
          closeGame()
          break
      }
    }

    // Инициализация
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      clearInterval(gameInterval.value)
      window.removeEventListener('keydown', handleKeyDown)
    })

    // Создаем еду при открытии
    watch(() => props.showSnakeGame, (newVal) => {
      if (newVal) {
        createFood()
      }
    })

    return {
      boardSize,
      snake,
      food,
      isPlaying,
      gameOver,
      score,
      level,
      changeDirection,
      toggleGame,
      resetGame,
      closeGame
    }
  }
}
</script>

<style scoped>
/* Модальное окно */
.snake-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.snake-modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.snake-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 15px 15px 0 0;
}

.snake-modal-header h2 {
  margin: 0;
  color: white;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.game-area {
  padding: 20px;
  position: relative;
}

.game-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  font-weight: bold;
}

/* Игровое поле */
.game-board {
  display: grid;
  gap: 1px;
  background: #34495e;
  border: 3px solid #e74c3c;
  border-radius: 10px;
  padding: 3px;
  /* margin: 0 auto 20px; */
  position: relative;
}

.game-board::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px dashed #e74c3c;
  border-radius: 10px;
  pointer-events: none;
}

.cell {
  width: 25px;
  height: 25px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.food {
  background: transparent;
  animation: pulse 1s infinite;
}

.snake-head {
  background: transparent;
}

.snake-body {
  background: transparent;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Мобильное управление */
.mobile-controls {
  /* padding: 20px; */
  background: #f8f9fa;
  border-radius: 15px;
  /* margin-bottom: 15px; */
}

.control-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.control-btn {
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

.control-btn:active {
  transform: scale(0.9);
}

.control-btn.up { background: #27ae60; }
.control-btn.down { background: #e67e22; }
.control-btn.left { background: #3498db; }
.control-btn.right { background: #9b59b6; }
.control-btn.play-pause { 
  background: #2c3e50; 
  width: 70px;
  height: 70px;
}

/* Кнопки управления */
.game-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.game-btn {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
  max-width: 150px;
}

.game-btn.play-again {
  background: #27ae60;
}

.game-btn:hover {
  opacity: 0.9;
}

/* Game Over экран */
.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
}

.game-over-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  max-width: 300px;
}

.game-over-content h3 {
  color: #e74c3c;
  margin: 0 0 15px 0;
}

.game-over-content p {
  margin: 10px 0;
  font-size: 16px;
}
</style>