<template>
    <div class="occasion-detail-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack"/>
            <UserIcon/>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            
            <!-- Детали Occasion -->
            <div class="occasion-details" v-if="occasion">
                <div class="occasion-header">
                    <div class="header-left">
                        <h1 class="occasion-title">Мероприятие: {{ occasion.name }}</h1>
                        <div class="occasion-meta">
                            <span class="occasion-date">{{ formatDate(occasion.startDate) }} - {{ formatDate(occasion.endDate) }}</span>
                            <span class="occasion-status" :class="getStateClass(occasion.state)">{{ occasion.stateDisplayValue }}</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button 
                            v-for="(action, index) in getHeaderActions()" 
                            :key="index"
                            :class="['action-btn', action.class]"
                            @click="action.onClick"
                        >
                            {{ action.label }}
                        </button>
                    </div>
                </div>

                <div class="occasion-content">
                    <div class="details-grid">
                        <div class="detail-item">
                            <label class="detail-label">Описание:</label>
                            <p class="detail-value">{{ occasion.description || 'Нет описания' }}</p>
                        </div>
                               
                        <div class="detail-item">
                            <label class="detail-label">Состояние:</label>
                            <p class="detail-value">{{ getLocalizedOccasionState() || 'Не указан' }}</p>
                        </div>

                        <div class="detail-item">
                            <label class="detail-label">Организатор:</label>
                            <p class="detail-value">{{ occasion.organization.value || 'Не указан' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Список активностей -->
            <div class="activities-section" v-if="activities.length > 0">
                <div class="section-header">
                    <h2 class="section-title">Активности</h2>
                    <div class="activities-count">{{ activities.length }} активностей</div>
                </div>

                <div class="activities-container">
                    <div class="activities-scroll-wrapper">
                        <div class="activities-horizontal-list">
                            <div v-for="(activity, index) in activities" 
                                 :key="activity.id" 
                                 class="activity-item">
                                <ActivityShortCard :activityCard="activity" @click="() => navigateToActivityDetail(activity.id)"/>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Навигационные стрелки -->
                    <button class="scroll-btn scroll-btn-prev" @click="scrollActivities(-1)" 
                            :disabled="isScrollAtStart">
                        ‹
                    </button>
                    <button class="scroll-btn scroll-btn-next" @click="scrollActivities(1)"
                            :disabled="isScrollAtEnd">
                        ›
                    </button>
                </div>
            </div>

            <!-- Состояние пустого списка активностей -->
            <div v-if="occasion && activities.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Нет активностей</h3>
                <p>Для этого мероприятия еще не добавлены активности</p>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchOccasionDetail">Попробовать снова</button>
            </div>
        </div>
    </div>
</template>

<script>
import ActivityShortCard from '../activity/ActivityShortCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { occasionApi } from '@/services/occasionApi.js';
import { activityApi } from '@/services/activityApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { occasionStateEnum } from '../../utils/EnumLocalizator.js';
import { useRouter } from 'vue-router';

export default {
  name: 'OccasionDetail',
  components: {
    ActivityShortCard,
    ControlPanel,
    UserIcon,
    LoadingOverlay
  },

  setup(props) {
    const router = useRouter()
    const handleBack = () => {
      router.go(-1);
    }

    return {
      handleBack
    }
  },

  data() {
    return {
      occasion: null,
      activities: [],
      isLoading: true,
      error: null,
      isScrollAtStart: true,
      isScrollAtEnd: false
    }
  },

  async mounted() {
    await this.fetchOccasionDetail();
  },

  methods: {
    async fetchOccasionDetail() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const occasionId = this.$route.params.occasionId;
        this.fillDetail(occasionId);
      } catch (err) {
        this.error = 'Не удалось загрузить данные мероприятия';
        console.error('Error fetching occasion detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fillDetail(occasionId) {
        this.occasion = await occasionApi.getOccasionDetail(occasionId);
        this.activities = await activityApi.getActivities(occasionId);
    },

    getLocalizedOccasionState() {
        return occasionStateEnum[this.occasion.state];
    },

    formatDate(dateString) {
      if (!dateString) return 'Не указана';
      return new Date(dateString).toLocaleDateString('ru-RU');
    },

    navigateToActivityDetail(activityId) {
        const router = this.$router;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const role = userInfo?.roles?.[0];

        if (role === 'SUPERADMIN') {
            router.push({
                name: 'ActivityDetail',
                params: { 
                    activityId: activityId
                }
            })
        } else if (role === 'ADMINISTRATOR') {
            router.push({
                name: 'ActivityRegistrationDetail',
                params: { 
                    activityId: activityId
                }
            })
        }
    },

    getStateClass(state) {
      const stateClasses = {
        'DRAFT': 'status-planned',
        'PLANNED': 'status-planned',
        'IN_PROGRESS': 'status-in-progress',
        'COMPLETED': 'status-completed',
      };
      return stateClasses[state] || 'status-unknown';
    },

    getHeaderActions() {
      if (!this.occasion) return [];

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const role = userInfo?.roles?.[0];

      const actions = [
        {
          label: 'Запланировать',
          class: 'default-action-btn',
          onClick: () => this.planOccasion(),
          visible: this.occasion.state === 'DRAFT' && role === 'SUPERADMIN'
        },
        {
          label: 'Старт',
          class: 'default-action-btn',
          onClick: () => this.startOccasion(),
          visible: this.occasion.state === 'PLANNED' && role === 'SUPERADMIN'
        },
        {
          label: 'Завершить',
          class: 'default-action-btn',
          onClick: () => this.completeOccasion(),
          visible: this.occasion.state === 'IN_PROGRESS' && role === 'SUPERADMIN'
        }
      ];

      return actions.filter(action => action.visible);
    },

    async planOccasion() {
        await occasionApi.planOccasion(this.occasion.id);
        this.fillDetail(this.occasion.id);
    },

    async startOccasion() {
        await occasionApi.startOccasion(this.occasion.id);
        this.fillDetail(this.occasion.id);
    },

    async completeOccasion() {
        await occasionApi.completeOccasion(this.occasion.id);
        this.fillDetail(this.occasion.id);
    },

    scrollActivities(direction) {
      const container = this.$el.querySelector('.activities-horizontal-list');
      if (container) {
        const scrollAmount = 300;
        container.scrollLeft += direction * scrollAmount;
        
        setTimeout(() => {
          this.updateScrollButtons();
        }, 100);
      }
    },

    updateScrollButtons() {
      const container = this.$el.querySelector('.activities-horizontal-list');
      if (container) {
        this.isScrollAtStart = container.scrollLeft <= 0;
        this.isScrollAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
      }
    },

    handleActivitiesScroll() {
      this.updateScrollButtons();
    }
  },

  watch: {
    '$route.params.occasionId': {
      handler() {
        this.fetchOccasionDetail();
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
.occasion-detail-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}

.header-container {
    background: white;
    padding: 15px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
}

/* Стили для деталей Occasion */
.occasion-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
    /* margin-bottom: 30px; */
}

.occasion-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
    gap: 20px;
}

.header-left {
    flex: 1;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;
    white-space: nowrap;
}

.default-action-btn {
    background: #17a2b8;
    color: white;
}

.default-action-btn:hover {
    background: #1abdd6;
    color: white;
}

.occasion-title {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
    line-height: 1.2;
}

.occasion-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.occasion-date {
    color: #666;
    font-size: 1.1rem;
    font-weight: 500;
}

.occasion-status {
    padding: 6px 30px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.status-planned { background: #e3f2fd; color: #1976d2; }
.status-in-progress { background: #fff3e0; color: #2e7d32 }
.status-completed { background: #e8f5e8; color: #f57c00; }
.status-unknown { background: #f5f5f5; color: #666; }

.details-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(300px, 1fr));
    gap: 20px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.detail-value {
    color: #666;
    margin: 0;
    line-height: 1.5;
}

/* Стили для секции активностей */
.activities-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}

.section-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.activities-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.activities-container {
    position: relative;
}

.activities-scroll-wrapper {
    overflow: hidden;
    border-radius: 8px;
}

.activities-horizontal-list {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 5px 5px;
    padding-bottom: 25px;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 transparent;
}

.activities-horizontal-list::-webkit-scrollbar {
    height: 6px;
}

.activities-horizontal-list::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

.activities-horizontal-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.activities-horizontal-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.activity-item {
    flex: 0 0 350px;
    min-width: 0;
}

/* Стили для кнопок скролла */
.scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    z-index: 10;
}

.scroll-btn:hover:not(:disabled) {
    background: #007bff;
    color: white;
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.scroll-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.scroll-btn-prev {
    left: -20px;
}

.scroll-btn-next {
    right: -20px;
}

/* Состояния пустого списка и ошибки */
.empty-state,
.error-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-top: 20px;
}

.empty-icon,
.error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.empty-state h3,
.error-state h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.empty-state p,
.error-state p {
    color: #666;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 20px;
}

.retry-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.3s ease;
}
</style>