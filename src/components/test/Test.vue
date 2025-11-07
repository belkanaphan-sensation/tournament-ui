<template>
  <div class="events-container">
    <!-- Первая колонка - Мероприятия -->
    <div class="column events-column">
      <h2>Мероприятия</h2>
      <div 
        v-for="event in events" 
        :key="event.id"
        class="event-card"
        :class="{ active: selectedEvent?.id === event.id }"
      >
        <div class="card-content" @click="selectEvent(event)">
          <h3>{{ event.title }}</h3>
          <p>{{ event.description }}</p>
          <span class="date">{{ event.date }}</span>
          <div class="status-badge" :class="event.status">{{ event.status }}</div>
        </div>
        <div class="actions">
          <button 
            v-for="action in getEventActions(event)" 
            :key="action.name"
            :class="['action-btn', action.type]"
            @click="handleEventAction(event, action)"
            :disabled="action.disabled"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Вторая колонка - Активности -->
    <div class="column activities-column" v-if="selectedEvent">
      <h2>Активности ({{ selectedEvent.title }})</h2>
      <div 
        v-for="activity in selectedEvent.activities" 
        :key="activity.id"
        class="activity-card"
        :class="{ active: selectedActivity?.id === activity.id }"
      >
        <div class="card-content" @click="selectActivity(activity)">
          <h4>{{ activity.title }}</h4>
          <p>{{ activity.description }}</p>
          <span class="type">{{ activity.type }}</span>
          <div class="status-badge" :class="activity.status">{{ activity.status }}</div>
        </div>
        <div class="actions">
          <button 
            v-for="action in getActivityActions(activity)" 
            :key="action.name"
            :class="['action-btn', action.type]"
            @click="handleActivityAction(activity, action)"
            :disabled="action.disabled"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Третья колонка - Этапы -->
    <div class="column stages-column" v-if="selectedActivity">
      <h2>Этапы ({{ selectedActivity.title }})</h2>
      <div 
        v-for="stage in selectedActivity.stages" 
        :key="stage.id"
        class="stage-card"
      >
        <div class="card-content">
          <h5>{{ stage.title }}</h5>
          <p>{{ stage.description }}</p>
          <span class="status" :class="stage.status">{{ stage.status }}</span>
        </div>
        <div class="actions">
          <button 
            v-for="action in getStageActions(stage)" 
            :key="action.name"
            :class="['action-btn', action.type]"
            @click="handleStageAction(stage, action)"
            :disabled="action.disabled"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventsContainer',
  data() {
    return {
      selectedEvent: null,
      selectedActivity: null,
      events: [
        {
          id: 1,
          title: 'Технологическая конференция 2024',
          description: 'Ежегодная конференция о новых технологиях',
          date: '2024-03-15',
          status: 'planning',
          activities: [
            {
              id: 101,
              title: 'Доклад о AI',
              description: 'Презентация о возможностях искусственного интеллекта',
              type: 'Доклад',
              status: 'preparation',
              stages: [
                {
                  id: 1001,
                  title: 'Отборочный',
                  description: 'Отборочный этап категории любители',
                  status: 'in-progress'
                },
                {
                  id: 1002,
                  title: 'Полуфинал',
                  description: 'Полуфинал категории любители',
                  status: 'pending'
                },
                {
                  id: 1003,
                  title: 'Финал',
                  description: 'Финал категории любители',
                  status: 'pending'
                }
              ]
            },
            {
              id: 102,
              title: 'Воркшоп по Vue.js',
              description: 'Практический семинар по разработке на Vue.js',
              type: 'Воркшоп',
              status: 'draft',
              stages: [
                {
                  id: 1004,
                  title: 'Подготовка примеров',
                  description: 'Разработка практических заданий',
                  status: 'completed'
                },
                {
                  id: 1005,
                  title: 'Тестирование оборудования',
                  description: 'Проверка компьютеров и проектора',
                  status: 'pending'
                }
              ]
            }
          ]
        },
        {
          id: 2,
          title: 'Спортивный фестиваль',
          description: 'Мероприятие для любителей активного отдыха',
          date: '2024-04-20',
          status: 'registration',
          activities: [
            {
              id: 201,
              title: 'Беговой забег',
              description: 'Забег на 5 км для всех желающих',
              type: 'Соревнование',
              status: 'active',
              stages: [
                {
                  id: 2001,
                  title: 'Регистрация участников',
                  description: 'Онлайн и оффлайн регистрация',
                  status: 'in-progress'
                },
                {
                  id: 2002,
                  title: 'Подготовка трассы',
                  description: 'Разметка и проверка безопасности',
                  status: 'pending'
                }
              ]
            },
            {
              id: 202,
              title: 'Йога на свежем воздухе',
              description: 'Групповое занятие йогой в парке',
              type: 'Мастер-класс',
              status: 'completed',
              stages: [
                {
                  id: 2003,
                  title: 'Подготовка площадки',
                  description: 'Расстановка ковриков и оборудования',
                  status: 'completed'
                }
              ]
            }
          ]
        },
        {
          id: 3,
          title: 'Благотворительный аукцион',
          description: 'Аукцион в поддержку местных благотворительных организаций',
          date: '2024-05-10',
          status: 'completed',
          activities: [
            {
              id: 301,
              title: 'Сбор лотов',
              description: 'Прием предметов для аукциона',
              type: 'Организационная',
              status: 'completed',
              stages: [
                {
                  id: 3001,
                  title: 'Информирование участников',
                  description: 'Рассылка информации о сборе лотов',
                  status: 'completed'
                },
                {
                  id: 3002,
                  title: 'Прием и учет лотов',
                  description: 'Фотографирование и описание предметов',
                  status: 'completed'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
    selectEvent(event) {
      this.selectedEvent = event
      this.selectedActivity = null
    },
    
    selectActivity(activity) {
      this.selectedActivity = activity
    },

    // Действия для мероприятий
    getEventActions(event) {
      const baseActions = [
        { name: 'edit', label: 'Редактировать', type: 'secondary' },
        { name: 'duplicate', label: 'Дублировать', type: 'secondary' }
      ]

      const statusActions = {
        planning: [
          { name: 'start_registration', label: 'Открыть регистрацию', type: 'primary' },
          { name: 'publish', label: 'Опубликовать', type: 'primary' }
        ],
        registration: [
          { name: 'close_registration', label: 'Закрыть регистрацию', type: 'warning' },
          { name: 'start_event', label: 'Начать мероприятие', type: 'primary' }
        ],
        active: [
          { name: 'complete', label: 'Завершить', type: 'success' },
          { name: 'cancel', label: 'Отменить', type: 'danger' }
        ],
        completed: [
          { name: 'archive', label: 'В архив', type: 'secondary' },
          { name: 'report', label: 'Отчет', type: 'primary' }
        ]
      }

      return [...baseActions, ...(statusActions[event.status] || [])]
    },

    // Действия для активностей
    getActivityActions(activity) {
      const baseActions = [
        { name: 'edit', label: 'Редактировать', type: 'secondary' },
        { name: 'move', label: 'Переместить', type: 'secondary' }
      ]

      const statusActions = {
        draft: [
          { name: 'publish', label: 'Опубликовать', type: 'primary' },
          { name: 'test', label: 'Тестировать', type: 'secondary' }
        ],
        preparation: [
          { name: 'start', label: 'Начать подготовку', type: 'primary' },
          { name: 'assign', label: 'Назначить ответственного', type: 'secondary' }
        ],
        active: [
          { name: 'pause', label: 'Приостановить', type: 'warning' },
          { name: 'complete', label: 'Завершить', type: 'success' }
        ],
        completed: [
          { name: 'review', label: 'Просмотреть результаты', type: 'primary' },
          { name: 'reopen', label: 'Переоткрыть', type: 'secondary' }
        ]
      }

      return [...baseActions, ...(statusActions[activity.status] || [])]
    },

    // Действия для этапов
    getStageActions(stage) {
      const baseActions = [
        { name: 'edit', label: 'Редактировать', type: 'secondary' }
      ]

      const statusActions = {
        pending: [
          { name: 'start', label: 'Начать', type: 'primary' },
          { name: 'skip', label: 'Пропустить', type: 'warning' }
        ],
        'in-progress': [
          { name: 'complete', label: 'Завершить', type: 'success' },
          { name: 'pause', label: 'Приостановить', type: 'warning' },
          { name: 'problem', label: 'Сообщить о проблеме', type: 'danger' }
        ],
        completed: [
          { name: 'reopen', label: 'Переоткрыть', type: 'secondary' },
          { name: 'review', label: 'Просмотреть', type: 'primary' }
        ]
      }

      return [...baseActions, ...(statusActions[stage.status] || [])]
    },

    // Обработчики действий
    handleEventAction(event, action) {
      console.log('Действие с мероприятием:', event.title, action.name)
      // Здесь будет ваша бизнес-логика
      alert(`Мероприятие: ${event.title}\nДействие: ${action.label}`)
      
      // Пример изменения статуса
      if (action.name === 'start_registration') {
        event.status = 'registration'
      } else if (action.name === 'complete') {
        event.status = 'completed'
      }
    },

    handleActivityAction(activity, action) {
      console.log('Действие с активностью:', activity.title, action.name)
      alert(`Активность: ${activity.title}\nДействие: ${action.label}`)
      
      // Пример изменения статуса
      if (action.name === 'start') {
        activity.status = 'active'
      } else if (action.name === 'complete') {
        activity.status = 'completed'
      }
    },

    handleStageAction(stage, action) {
      console.log('Действие с этапом:', stage.title, action.name)
      alert(`Этап: ${stage.title}\nДействие: ${action.label}`)
      
      // Пример изменения статуса
      if (action.name === 'start') {
        stage.status = 'in-progress'
      } else if (action.name === 'complete') {
        stage.status = 'completed'
      } else if (action.name === 'reopen') {
        stage.status = 'pending'
      }
    }
  }
}
</script>

<style scoped>
.events-container {
  display: flex;
  min-height: 600px;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  font-family: Arial, sans-serif;
}

.column {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-height: 400px;
}

.column h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.event-card,
.activity-card,
.stage-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.event-card.active,
.activity-card.active {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.card-content {
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.card-content:hover {
  background-color: #f8f9fa;
}

.event-card:hover,
.activity-card:hover,
.stage-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.2);
}

.event-card h3,
.activity-card h4,
.stage-card h5 {
  margin: 0 0 8px 0;
  color: #333;
}

.event-card p,
.activity-card p,
.stage-card p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.date,
.type,
.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
}

.date {
  background-color: #e3f2fd;
  color: #1976d2;
}

.type {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.status {
  text-transform: uppercase;
}

.status.completed {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status.in-progress {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status.pending {
  background-color: #f5f5f5;
  color: #757575;
}

/* Бейджи статусов для мероприятий и активностей */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  margin-left: 8px;
}

.status-badge.planning { background: #e3f2fd; color: #1976d2; }
.status-badge.registration { background: #fff3e0; color: #ef6c00; }
.status-badge.active { background: #e8f5e8; color: #2e7d32; }
.status-badge.completed { background: #f5f5f5; color: #757575; }
.status-badge.draft { background: #f5f5f5; color: #9e9e9e; }
.status-badge.preparation { background: #fff3e0; color: #ff9800; }

/* Стили для кнопок действий */
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 15px;
  background-color: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 80px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background-color: #007bff;
  color: white;
}

.action-btn.secondary {
  background-color: #6c757d;
  color: white;
}

.action-btn.success {
  background-color: #28a745;
  color: white;
}

.action-btn.warning {
  background-color: #ffc107;
  color: #212529;
}

.action-btn.danger {
  background-color: #dc3545;
  color: white;
}

/* Анимация появления колонок */
.activities-column,
.stages-column {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .events-container {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}
</style>