<template>
    <div class="milestone-detail-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            
            <!-- Детали Milestone -->
            <div class="milestone-details" v-if="milestone">
                <div class="milestone-header">
                    <div class="header-left">
                        <h1 class="milestone-title">Этап: {{ milestone.name }}</h1>
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

                <div class="milestone-content">
                    <div class="details-grid">
                        <div class="detail-item">
                            <Field label="Описание" :value= "milestone.description"/>
                        </div>

                        <div class="detail-item">
                            <Field label="Состояние" :class="getStateClass()" :value= "getLocalizedMilestoneState()"/>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Список раундов -->
            <div class="rounds-section" v-if="rounds.length > 0">
                <div class="section-header">
                    <h2 class="section-title">Раунды</h2>
                    <div class="rounds-count">{{ rounds.length }} раундов</div>
                </div>

                <div class="rounds-container">
                    <div class="rounds-scroll-wrapper">
                        <div class="rounds-horizontal-list">
                            <div v-for="(round, index) in rounds" 
                                 :key="round.id" 
                                 class="round-item">
                                <RoundShortCard :roundCard="round" @click="() => navigateToRoundDetail(round.id)"/>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Навигационные стрелки -->
                    <button class="scroll-btn scroll-btn-prev" @click="scrollRounds(-1)" 
                            :disabled="isScrollAtStart">
                        ‹
                    </button>
                    <button class="scroll-btn scroll-btn-next" @click="scrollRounds(1)"
                            :disabled="isScrollAtEnd">
                        ›
                    </button>
                </div>
            </div>

            <!-- Состояние пустого списка раундов -->
            <div v-if="milestone && rounds.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Нет раундов</h3>
                <p>Для этого этапа еще не добавлены раунды</p>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchMilestoneDetail">Попробовать снова</button>
            </div>
        </div>
    </div>
</template>

<script>
import RoundShortCard from '../round/RoundShortCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { roundApi } from '@/services/roundApi.js';
import { activityApi } from '@/services/activityApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { milestoneStateEnum } from '../../utils/EnumLocalizator.js';
import { useRouter } from 'vue-router';
import Field from '../common/Field.vue'

export default {
  name: 'MilestoneDetail',
  components: {
    RoundShortCard,
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
      milestone: null,
      activity: null,
      rounds: [],
      isLoading: true,
      error: null,
      isScrollAtStart: true,
      isScrollAtEnd: false
    }
  },

  async mounted() {
    await this.fetchMilestoneDetail();
  },

  methods: {
    async fetchMilestoneDetail() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const milestoneId = this.$route.params.milestoneId;
        this.fillDetail(milestoneId);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fillDetail(milestoneId) {
        this.milestone = await milestoneApi.getMilestoneDetail(milestoneId);
        this.activity = await activityApi.getActivityDetail(this.milestone.activity.id);
        this.rounds = await roundApi.getRounds(milestoneId);
    },

    navigateToRoundDetail(roundId) {
        const router = this.$router;

        router.push({
            name: 'RoundDetail',
            params: { 
                roundId: roundId
            }
        })
    },

    navigateToMilestoneResultDetail() {
        const router = this.$router;

        router.push({
            name: 'MilestoneResultDetail',
            params: { 
                milestoneId: this.milestone.id
            }
        });
    },

    getLocalizedMilestoneState() {
        return milestoneStateEnum[this.milestone.state];
    },

    formatDate(dateString) {
      if (!dateString) return 'Не указана';
      return new Date(dateString).toLocaleDateString('ru-RU');
    },

    getHeaderActions() {
      if (!this.milestone) return [];

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const role = userInfo?.roles?.[0];

      const actions = [
        {
          label: 'Запланировать',
          class: 'default-action-btn',
          onClick: () => this.planMilestone(),
          visible: this.milestone.state === 'DRAFT' && role === 'SUPERADMIN'
        },
        //не нужно пока показывать, нет функционала и проверок состояния активности
        // {
        //   label: 'Вернуть в редактирование',
        //   class: 'default-action-btn',
        //   onClick: () => this.backToDraft(),
        //   visible: this.milestone.state === 'PLANNED'
        // },
        {
          label: 'Подготовить раунды',
          class: 'default-action-btn',
          onClick: () => this.prepareRounds(),
          visible: this.milestone.state === 'PLANNED' && this.activity.state === 'IN_PROGRESS' && role === 'SUPERADMIN'
        },
        {
          label: 'Старт',
          class: 'default-action-btn',
          onClick: () => this.startMilestone(),
          visible: this.milestone.state === 'PENDING' && role === 'SUPERADMIN'
        },
        {
          label: 'Подсчитать результаты',
          class: 'default-action-btn',
          onClick: () => this.sumUpMilestone(),
          visible: this.milestone.state === 'IN_PROGRESS' && role === 'SUPERADMIN'
        },
        {
          label: 'Результаты',
          class: 'default-action-btn',
          onClick: () => this.navigateToMilestoneResultDetail(),
          visible: this.milestone.state === 'SUMMARIZING' && role === 'SUPERADMIN'
        },
        {
          label: 'Завершить Этап',
          class: 'default-action-btn',
          onClick: () => this.completeMilestone(),
          visible: this.milestone.state === 'SUMMARIZING' && role === 'SUPERADMIN'
        },
        {
          label: 'Пропустить этап',
          class: 'default-action-btn',
          onClick: () => this.skipMilestone(),
          visible: (this.milestone.state === 'DRAFT' || this.milestone.state === 'PLANNED' || this.milestone.state === 'PENDING') && role === 'SUPERADMIN'
        },
      ];

      return actions.filter(action => action.visible);
    },

    async planMilestone() {
        await milestoneApi.planMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    async backToDraft() {
        await milestoneApi.backToDraft(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    async prepareRounds() {
        await milestoneApi.prepareRounds(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    async startMilestone() {
        await milestoneApi.startMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    async sumUpMilestone() {
        await milestoneApi.sumUpMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    async completeMilestone() {
        await milestoneApi.completeMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    async skipMilestone() {
        await milestoneApi.skipMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
    },

    scrollRounds(direction) {
      const container = this.$el.querySelector('.rounds-horizontal-list');
      if (container) {
        const scrollAmount = 300;
        container.scrollLeft += direction * scrollAmount;
        
        setTimeout(() => {
          this.updateScrollButtons();
        }, 100);
      }
    },

    updateScrollButtons() {
      const container = this.$el.querySelector('.rounds-horizontal-list');
      if (container) {
        this.isScrollAtStart = container.scrollLeft <= 0;
        this.isScrollAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
      }
    },

    handleRoundsScroll() {
      this.updateScrollButtons();
    },

    getStateClass() {
      const stateClasses = {
        'DRAFT': 'status-opened',
        'PLANNED': 'status-opened',
        'PENDING': 'status-opened',
        'IN_PROGRESS': 'status-opened',
        'SUMMARIZING': 'status-opened',
        'COMPLETED': 'status-closed',
        'SKIPPED': 'status-closed',
      };
      return stateClasses[this.milestone.state] || 'status-unknown';
    },

    handleRefresh() {
        window.location.reload();
    },
  },

  watch: {
    '$route.params.milestoneId': {
      handler() {
        this.fetchMilestoneDetail();
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

.milestone-detail-page {
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

/* Стили для деталей Milestone */
.milestone-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
}

.milestone-header {
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

.milestone-title {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
    line-height: 1.2;
}

.milestone-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.milestone-date {
    color: #666;
    font-size: 1.1rem;
    font-weight: 500;
}

.milestone-status {
    padding: 6px 30px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

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

/* Стили для секции раундов */
.rounds-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px;
    margin-top: 30px;
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

.rounds-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.rounds-container {
    position: relative;
}

.rounds-scroll-wrapper {
    overflow: hidden;
    border-radius: 8px;
}

.rounds-horizontal-list {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 5px 5px;
    padding-bottom: 25px;
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 transparent;
}

.rounds-horizontal-list::-webkit-scrollbar {
    height: 6px;
}

.rounds-horizontal-list::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
}

.rounds-horizontal-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.rounds-horizontal-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.round-item {
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

.retry-btn:hover {
    background: #0056b3;
}
</style>