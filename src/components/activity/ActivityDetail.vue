<template>
    <div class="activity-detail-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack"/>
            <UserIcon/>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            
            <!-- Детали Activity -->
            <div class="activity-details" v-if="activity">
                <div class="activity-header">
                    <div class="header-left">
                        <h1 class="activity-title">Активность: {{ activity.name }}</h1>
                        <div class="activity-meta">
                            <span class="activity-date">{{ formatDate(activity.startDate) }} - {{ formatDate(activity.endDate) }}</span>
                            <span class="activity-status" :class="getStateClass(activity.state)">{{ activity.stateDisplayValue }}</span>
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

                <div class="activity-content">
                    <div class="details-grid">
                        <div class="detail-item">
                            <Field label="Описание" :value= "activity.description"/>
                        </div>

                        <div class="detail-item">
                            <Field label="Состояние" :class="getStateClass()" :value= "getLocalizedActivityState()"/>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Список майлстоунов -->
            <div class="milestones-section" v-if="milestones.length > 0">
                <div class="section-header">
                    <h2 class="section-title">Этапы</h2>
                    <div class="milestones-count">{{ milestones.length }} этапов</div>
                </div>

                <div class="milestones-container">
                    <div class="milestones-scroll-wrapper">
                        <div class="milestones-horizontal-list">
                            <div v-for="(milestone, index) in milestones" 
                                 :key="milestone.id" 
                                 class="milestone-item">
                                <MilestoneShortCard :milestoneCard="milestone" @click="() => navigateToMilestoneDetail(milestone.id)"/>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Навигационные стрелки -->
                    <button class="scroll-btn scroll-btn-prev" @click="scrollMilestones(-1)" 
                            :disabled="isScrollAtStart">
                        ‹
                    </button>
                    <button class="scroll-btn scroll-btn-next" @click="scrollMilestones(1)"
                            :disabled="isScrollAtEnd">
                        ›
                    </button>
                </div>
            </div>

            <!-- Состояние пустого списка майлстоунов -->
            <div v-if="activity && milestones.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Нет майлстоунов</h3>
                <p>Для этой активности еще не добавлены майлстоуны</p>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchActivityDetail">Попробовать снова</button>
            </div>
        </div>
    </div>
</template>

<script>
import MilestoneShortCard from '../milestone/MilestoneShortCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { activityApi } from '@/services/activityApi.js';
import { milestoneApi } from '@/services/milestoneApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { activityStateEnum } from '../../utils/EnumLocalizator.js';
import { useRouter } from 'vue-router';
import Field from '../common/Field.vue'

export default {
  name: 'ActivityDetail',
  components: {
    MilestoneShortCard,
    ControlPanel,
    UserIcon,
    LoadingOverlay,
    Field
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
      activity: null,
      milestones: [],
      isLoading: true,
      error: null,
      isScrollAtStart: true,
      isScrollAtEnd: false
    }
  },

  async mounted() {
    await this.fetchActivityDetail();
  },

  methods: {
    async fetchActivityDetail() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const activityId = this.$route.params.activityId;
        this.fillDetail(activityId);
      } catch (err) {
        this.error = 'Не удалось загрузить данные активности';
        console.error('Error fetching activity detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fillDetail(activityId) {
        this.activity = await activityApi.getActivityDetail(activityId);
        this.milestones = await milestoneApi.getMilestones(activityId);
    },

    navigateToMilestoneDetail(milestoneId, activityId) {
        const router = this.$router;

        router.push({
            name: 'MilestoneDetail',
            params: { 
                milestoneId: milestoneId,
            }
        })
    },

    getLocalizedActivityState() {
        return activityStateEnum[this.activity.state];
    },

    formatDate(dateString) {
      if (!dateString) return 'Не указана';
      return new Date(dateString).toLocaleDateString('ru-RU');
    },

    getHeaderActions() {
      if (!this.activity) return [];

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const role = userInfo?.roles?.[0];

      const actions = [
        {
          label: 'Запланировать',
          class: 'default-action-btn',
          onClick: () => this.planActivity(),
          visible: this.activity.state === 'DRAFT' && role === 'SUPERADMIN'
        },
        {
          label: 'Вернуть в редактирование',
          class: 'default-action-btn',
          onClick: () => this.backToDraft(),
          visible: this.activity.state === 'PLANNED' && role === 'SUPERADMIN'
        },
        {
          label: 'Закрыть регистрацию',
          class: 'default-action-btn',
          onClick: () => this.closeRegistration(),
          visible: this.activity.state === 'PLANNED' && role === 'SUPERADMIN'
        },
        // {
        //   label: 'Вернуть в Запланирован',
        //   class: 'default-action-btn',
        //   onClick: () => this.backToPlanned(),
        //   visible: this.activity.state === 'REGISTRATION_CLOSED' && role === 'SUPERADMIN'
        // },
        {
          label: 'Старт',
          class: 'default-action-btn',
          onClick: () => this.startActivity(),
          visible: this.activity.state === 'REGISTRATION_CLOSED' && role === 'SUPERADMIN'
        },
        {
          label: 'Подсчитать результаты',
          class: 'default-action-btn',
          onClick: () => this.sumUpActivity(),
          visible: this.activity.state === 'IN_PROGRESS' && this.milestones.every(milestone => 
                ['COMPLETED', 'SKIPPED'].includes(milestone.state)) && role === 'SUPERADMIN'
        },
        {
          label: 'Заершить активность',
          class: 'default-action-btn',
          onClick: () => this.completeActivity(),
          visible: this.activity.state === 'SUMMARIZING' && role === 'SUPERADMIN'
        }
      ];

      return actions.filter(action => action.visible);
    },

    async planActivity() {
        await activityApi.planActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async backToDraft() {
        await activityApi.backToDraft(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async closeRegistration() {
        await activityApi.closeRegistration(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async startActivity() {
        await activityApi.startActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async backToPlanned() {
        await activityApi.backToPlanned(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async sumUpActivity() {
        await activityApi.sumUpActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async completeActivity() {
        await activityApi.completeActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    scrollMilestones(direction) {
      const container = this.$el.querySelector('.milestones-horizontal-list');
      if (container) {
        const scrollAmount = 300;
        container.scrollLeft += direction * scrollAmount;
        
        setTimeout(() => {
          this.updateScrollButtons();
        }, 100);
      }
    },

    updateScrollButtons() {
      const container = this.$el.querySelector('.milestones-horizontal-list');
      if (container) {
        this.isScrollAtStart = container.scrollLeft <= 0;
        this.isScrollAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
      }
    },

    handleMilestonesScroll() {
      this.updateScrollButtons();
    },

    getStateClass() {
      const stateClasses = {
        'DRAFT': 'status-opened',
        'PLANNED': 'status-opened',
        'IN_PROGRESS': 'status-opened',
        'COMPLETED': 'status-closed'
      };
      return stateClasses[this.activity.state] || 'status-unknown';
    },
  },

  watch: {
    '$route.params.activityId': {
      handler() {
        this.fetchActivityDetail();
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
.status-opened { background: #e3f2fd; color: #1976d2; }
.status-closed { background: #e8f5e8; color: #2e7d32; }
.status-unknown { background: #f5f5f5; color: #666; }

.activity-detail-page {
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
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
}

/* Стили для деталей Activity */
.activity-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
    /* margin-bottom: 30px; */
}

.activity-header {
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

.activity-title {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
    line-height: 1.2;
}

.activity-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.activity-date {
    color: #666;
    font-size: 1.1rem;
    font-weight: 500;
}

.activity-status {
    padding: 6px 30px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.status-planned { background: #e3f2fd; color: #1976d2; }
.status-in-progress { background: #fff3e0; color: #f57c00; }
.status-completed { background: #e8f5e8; color: #2e7d32; }
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

/* Стили для секции майлстоунов */
.milestones-section {
    background: white;
    border-radius: 12px;
    margin-top: 30px;
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

.milestones-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.milestones-container {
    position: relative;
}

.milestones-scroll-wrapper {
    overflow: hidden;
    border-radius: 8px;
}

.milestones-horizontal-list {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 5px 5px;
    padding-bottom: 25px;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 transparent;
}

.milestones-horizontal-list::-webkit-scrollbar {
    height: 6px;
}

.milestones-horizontal-list::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

.milestones-horizontal-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.milestones-horizontal-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.milestone-item {
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
    /* padding: 60px 20px; */
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