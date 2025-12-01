<template>
  <div class="snake-game-page">
    <!-- Шапка над всем -->
    <header class="game-header">
      <div class="header-top">
        <button @click="goBack" class="back-btn">
          ← Назад
        </button>
        <div class="game-title">
          <h1>🎮 Змейка</h1>
        </div>
      </div>
    </header>

    <!-- Основной контейнер с игрой -->
    <div class="game-container">
      <!-- Игровая область -->
      <main class="game-main">
        <!-- Игровое поле -->
        <div class="game-board-wrapper">
          <div class="game-board" 
               :style="{
                 gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                 gridTemplateRows: `repeat(${boardSize}, 1fr)`
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
        </div>
        
        <!-- Панель управления стрелками -->
        <div class="mobile-controls-compact">
          <div class="control-row">
            <button @click="changeDirection('up')" class="mobile-btn up-btn">↑</button>
          </div>
          <div class="control-row">
            <button @click="changeDirection('left')" class="mobile-btn left-btn">←</button>
            <button @click="toggleGame" class="mobile-btn center-btn">
              {{ isPlaying ? '⏸' : '▶' }}
            </button>
            <button @click="changeDirection('right')" class="mobile-btn right-btn">→</button>
          </div>
          <div class="control-row">
            <button @click="changeDirection('down')" class="mobile-btn down-btn">↓</button>
          </div>
        </div>

        <!-- Кнопки управления (теперь после стрелок) -->
        <div class="main-controls">
          <button @click="toggleGame" class="control-btn primary-btn">
            {{ isPlaying ? '⏸ Пауза' : '▶ Старт' }}
          </button>
          <button @click="resetGame" class="control-btn secondary-btn">
            🔄 Новая игра
          </button>
        </div>
        
        <!-- Инструкция -->
        <div class="compact-instructions">
          <div class="instruction-item">
            <span class="key">↑↓←→</span>
            <span>Движение</span>
          </div>
          <div class="instruction-item">
            <span class="key">Пробел</span>
            <span>Пауза</span>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Экран Game Over (отдельно, поверх всего) -->
    <div v-if="gameOver" class="game-over-screen">
      <div class="game-over-content">
        <div class="result-icon">🎯</div>
        <h3>Игра окончена!</h3>
        <div class="result-stats">
          <div class="result-item">
            <span>Счёт:</span>
            <span class="result-value">{{ score }}</span>
          </div>
        </div>
        <div class="result-actions">
          <button @click="resetGame" class="result-btn play-again-btn">
            Играть снова
          </button>
          <button @click="goBack" class="result-btn back-btn">
            Назад
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SnakeGamePage',
  
  setup() {
    const router = useRouter()
    const boardSize = ref(13)
    const initialSpeed = 150
    
    // Состояние игры
    const snake = ref([{ x: 6, y: 6 }])
    const food = ref(null)
    const direction = ref('right')
    const nextDirection = ref('right')
    const isPlaying = ref(false)
    const gameOver = ref(false)
    const score = ref(0)
    const level = ref(1)
    const gameInterval = ref(null)
    
    // Переход назад
    const goBack = () => {
      if (gameInterval.value) {
        clearInterval(gameInterval.value)
      }
      router.go(-1)
    }
    
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

    // Движение змейки
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

      // Проверка границ
      if (head.x < 0 || head.x >= boardSize.value || 
          head.y < 0 || head.y >= boardSize.value) {
        endGame()
        return
      }

      // Проверка столкновения с собой
      if (snake.value.slice(1).some(segment => 
        segment.x === head.x && segment.y === head.y)) {
        endGame()
        return
      }

      // Добавляем новую голову
      snake.value.unshift(head)

      // Проверка съедания еды
      if (food.value && head.x === food.value.x && head.y === food.value.y) {
        score.value += 10 * level.value
        
        // Проверяем уровень
        const newLevel = Math.floor(score.value / 100) + 1
        if (newLevel > level.value) {
          level.value = newLevel
        }
        
        createFood()
        
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
      
      const speed = Math.max(50, initialSpeed - (level.value - 1) * 10)
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
      
      snake.value = [{ x: 6, y: 6 }]
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
          goBack()
          break
      }
    }

    // Инициализация
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      createFood()
    })

    onUnmounted(() => {
      clearInterval(gameInterval.value)
      window.removeEventListener('keydown', handleKeyDown)
    })

    return {
      boardSize,
      snake,
      food,
      isPlaying,
      gameOver,
      score,
      level,
      goBack,
      changeDirection,
      toggleGame,
      resetGame
    }
  }
}
</script>

<style scoped>
.snake-game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Шапка - фиксированная сверху */
.game-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

.game-title h1 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
  text-align: center;
  flex: 1;
}

/* Основной контейнер игры */
.game-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

/* Основная игровая область */
.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  overflow: auto;
  min-height: 0;
}

/* Игровое поле */
.game-board-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 5px 5px 15px;
}

.game-board {
  display: grid;
  gap: 1px;
  background: rgba(30, 40, 60, 0.8);
  border: 2px solid #ff6b6b;
  border-radius: 10px;
  padding: 3px;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1/1;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(10px, 3vw, 16px);
  border-radius: 2px;
}

.food {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Панель управления стрелками */
.mobile-controls-compact {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  margin: 0 10px 15px;
  flex-shrink: 0;
}

.control-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
}

.mobile-btn {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 12px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.mobile-btn:active {
  transform: scale(0.92);
}

.up-btn { 
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.down-btn { 
  background: linear-gradient(135deg, #ff9a9e, #fad0c4);
}

.left-btn { 
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #333;
}

.right-btn { 
  background: linear-gradient(135deg, #d4fc79, #96e6a1);
  color: #333;
}

.center-btn { 
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  font-size: 26px;
  margin: 0 20px;
}

/* Основные кнопки управления (теперь после стрелок) */
.main-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 10px 15px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin: 0 10px 15px;
}

.control-btn {
  flex: 1;
  max-width: 160px;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  white-space: nowrap;
}

.primary-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  box-shadow: 0 3px 8px rgba(78, 205, 196, 0.3);
}

.primary-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(78, 205, 196, 0.3);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.secondary-btn:active {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.98);
}

/* Компактная инструкция */
.compact-instructions {
  display: flex;
  justify-content: center;
  gap: 25px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin: 0 10px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  opacity: 0.9;
}

.key {
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 60px;
  text-align: center;
}

/* Game Over экран (поверх всего) */
.game-over-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.game-over-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  width: 100%;
  max-width: 320px;
  border: 2px solid rgba(78, 205, 196, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
}

.result-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
}

.game-over-content h3 {
  margin: 0 0 25px 0;
  font-size: 1.6rem;
  color: white;
}

.result-stats {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 17px;
}

.result-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4ecdc4;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.play-again-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.play-again-btn:active {
  transform: scale(0.98);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

/* Адаптивность */
@media (max-height: 700px) {
  .game-header {
    padding: 10px 12px;
  }
  
  .game-title h1 {
    font-size: 1.4rem;
  }
  
  .game-board {
    max-width: 350px;
  }
  
  .mobile-btn {
    width: 55px;
    height: 55px;
    font-size: 22px;
  }
  
  .center-btn {
    width: 65px;
    height: 65px;
    font-size: 24px;
    margin: 0 15px;
  }
  
  .mobile-controls-compact {
    padding: 12px;
    margin: 0 10px 12px;
  }
  
  .control-row {
    margin: 10px 0;
  }
  
  .main-controls {
    padding: 8px 12px;
    margin: 0 10px 12px;
  }
  
  .control-btn {
    padding: 12px;
    font-size: 14px;
    max-width: 140px;
  }
  
  .compact-instructions {
    padding: 10px;
    gap: 20px;
  }
}

@media (max-height: 600px) {
  .game-header {
    padding: 8px 10px;
  }
  
  .game-title h1 {
    font-size: 1.3rem;
  }
  
  .back-btn {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .game-main {
    padding: 10px;
  }
  
  .game-board-wrapper {
    padding: 3px 3px 10px;
  }
  
  .game-board {
    max-width: 300px;
    border-width: 1px;
    border-radius: 8px;
  }
  
  .mobile-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
    border-radius: 10px;
  }
  
  .center-btn {
    width: 58px;
    height: 58px;
    font-size: 22px;
    margin: 0 12px;
  }
  
  .mobile-controls-compact {
    padding: 10px;
    margin: 0 8px 10px;
    border-radius: 12px;
  }
  
  .control-row {
    margin: 8px 0;
  }
  
  .main-controls {
    padding: 6px 10px;
    margin: 0 8px 10px;
    gap: 10px;
    border-radius: 10px;
  }
  
  .control-btn {
    padding: 10px;
    font-size: 13px;
    max-width: 130px;
  }
  
  .compact-instructions {
    padding: 8px;
    gap: 15px;
    margin: 0 8px;
    border-radius: 8px;
  }
  
  .instruction-item {
    font-size: 12px;
  }
  
  .key {
    padding: 4px 8px;
    min-width: 55px;
  }
}

@media (max-height: 500px) {
  .game-header {
    padding: 6px 8px;
  }
  
  .game-title h1 {
    font-size: 1.2rem;
  }
  
  .back-btn {
    padding: 5px 8px;
    font-size: 12px;
  }
  
  .game-main {
    padding: 8px;
  }
  
  .game-board {
    max-width: 250px;
  }
  
  .mobile-btn {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
  
  .center-btn {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin: 0 10px;
  }
  
  .mobile-controls-compact {
    padding: 8px;
    margin: 0 5px 8px;
  }
  
  .control-row {
    margin: 6px 0;
  }
  
  .main-controls {
    padding: 5px 8px;
    margin: 0 5px 8px;
  }
  
  .control-btn {
    padding: 8px;
    font-size: 12px;
    max-width: 110px;
  }
  
  .compact-instructions {
    display: none; /* Скрываем инструкцию на очень маленьких экранах */
  }
}

/* Ландшафтная ориентация */
@media (orientation: landscape) and (max-height: 500px) {
  .snake-game-page {
    flex-direction: row;
  }
  
  .game-header {
    width: 180px;
    flex-direction: column;
    justify-content: flex-start;
    padding: 15px 10px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: none;
  }
  
  .header-top {
    flex-direction: column;
    gap: 15px;
  }
  
  .game-title h1 {
    font-size: 1.3rem;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }
  
  .game-container {
    flex: 1;
  }
  
  .game-main {
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
    padding: 10px;
  }
  
  .game-board-wrapper {
    flex: 2;
    min-width: 250px;
    padding: 5px;
  }
  
  .mobile-controls-compact {
    flex: 1;
    margin: 10px;
    min-width: 200px;
  }
  
  .main-controls {
    flex-basis: 100%;
    margin: 10px;
    order: 3;
  }
  
  .compact-instructions {
    flex-basis: 100%;
    margin: 5px 10px;
    order: 4;
  }
}
</style>