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
                          <Field label="Описание" :value= "milestone.description"/>
                          <Field label="Состояние" :class="getStateClass()" :value= "getLocalizedMilestoneState()"/>
                          <Field label="Участников" :value= "getContestantStatistic"/>
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
                    <div class="rounds-grid">
                        <div v-for="(round, index) in rounds" 
                             :key="round.id" 
                             class="round-item">
                            <RoundShortCard :roundCard="round" @click="() => navigateToRoundDetail(round.id)"/>
                        </div>
                    </div>
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

            <!-- Модальное окно подготовки раундов -->
            <PrepareRoundsModal 
                v-if="showPrepareRoundsModal"
                :show="showPrepareRoundsModal"
                :milestoneName="milestone.name"
                :milestoneRule="milestoneRule"
                @close="handleClosePrepareRoundsModal"
                @confirm="handleConfirmPrepareRounds"
            />
        </div>
    </div>
</template>

<script>
import RoundShortCard from '../round/RoundShortCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { milestoneRuleApi } from '@/services/milestoneRuleApi.js';
import { roundApi } from '@/services/roundApi.js';
import { activityApi } from '@/services/activityApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { milestoneStateEnum } from '../../utils/EnumLocalizator.js';
import { useRouter } from 'vue-router';
import Field from '../common/Field.vue'
import PrepareRoundsModal from './PrepareRoundsModal.vue';

export default {
  name: 'MilestoneDetail',
  components: {
    RoundShortCard,
    ControlPanel,
    UserIcon,
    LoadingOverlay,
    Field,
    PrepareRoundsModal
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
      milestoneRule: null,
      activity: null,
      rounds: [],
      isLoading: true,
      error: null,
      showPrepareRoundsModal: false,
      prepareRoundsAction: null
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
        const tempMilestone = await milestoneApi.getMilestoneDetail(milestoneId);
        const tempMilestoneRule = await milestoneRuleApi.getMilestoneRuleByMilestoneId(milestoneId);
        const tempRounds = await roundApi.getRounds(milestoneId);
        const tempActivity = await activityApi.getActivityDetail(tempMilestone.activity.id);
        
        this.milestone = tempMilestone;
        this.milestoneRule = tempMilestoneRule;
        this.rounds = tempRounds;
        this.activity = tempActivity;
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
          {
              label: 'Подготовить раунды',
              class: 'default-action-btn',
              onClick: () => this.openPrepareRoundsModal(),
              visible: this.milestone.state === 'PLANNED' && this?.activity.state === 'IN_PROGRESS' && role === 'SUPERADMIN'
          },
          {
              label: 'Перегенерировать раунды',
              class: 'default-action-btn',
              onClick: () => this.openRegenerateRoundsModal(),
              visible: this.milestone.state === 'PENDING' && this?.activity.state === 'IN_PROGRESS' && role === 'SUPERADMIN'
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
              visible: (this.milestone.state === 'SUMMARIZING' || this.milestone.state === 'COMPLETED') && role === 'SUPERADMIN'
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

    openPrepareRoundsModal() {
      this.prepareRoundsAction = 'prepare';
      this.showPrepareRoundsModal = true;
    },

    openRegenerateRoundsModal() {
      this.prepareRoundsAction = 'regenerate';
      this.showPrepareRoundsModal = true;
    },

    handleClosePrepareRoundsModal() {
      this.showPrepareRoundsModal = false;
      this.prepareRoundsAction = null;
    },

    async handleConfirmPrepareRounds(customRoundLimit) {
      try {
        if (this.prepareRoundsAction === 'prepare') {
          await this.prepareRounds(customRoundLimit);
        } else if (this.prepareRoundsAction === 'regenerate') {
          await this.regenerateRounds(customRoundLimit);
        }
        this.showPrepareRoundsModal = false;
        this.prepareRoundsAction = null;
      } catch (error) {
        console.error('Ошибка при работе с раундами:', error);
      }
    },

    async planMilestone() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await milestoneApi.planMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async backToDraft() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await milestoneApi.backToDraft(this.milestone.id);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async prepareRounds(customRoundLimit = null) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const request = customRoundLimit ? { roundContestantLimit: customRoundLimit } : {};
        await milestoneApi.prepareRounds(this.milestone.id, request);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async regenerateRounds(customRoundLimit = null) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const request = customRoundLimit ? { roundContestantLimit: customRoundLimit } : {};
        await milestoneApi.regenerateRounds(this.milestone.id, request);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async startMilestone() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await milestoneApi.startMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async sumUpMilestone() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await milestoneApi.sumUpMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async completeMilestone() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await milestoneApi.completeMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async skipMilestone() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await milestoneApi.skipMilestone(this.milestone.id);
        this.fillDetail(this.milestone.id);
      } catch (err) {
        this.error = 'Не удалось загрузить данные этапа';
        console.error('Error fetching milestone detail:', err);
      } finally {
        this.isLoading = false;
      }
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
  },

  computed: {
    getContestantStatistic() {
      const counts = this.milestone?.contestantCount;
        if (!counts) return '';

        const parts = [];

        if (counts.LEADER !== undefined && counts.LEADER !== null) {
          parts.push(`Партнеров ${counts.LEADER}`);
        }

        if (counts.FOLLOWER !== undefined && counts.FOLLOWER !== null) {
          parts.push(`Партнерш ${counts.FOLLOWER}`);
        }

        if (counts.COUPLE !== undefined && counts.COUPLE !== null) {
          parts.push(`Пар ${counts.COUPLE}`);
        }

        return parts.join(', ');
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
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    padding: 20px;
}

/* Стили для деталей Milestone */
.milestone-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
    margin-bottom: 30px;
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

.rounds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 5px 0;
}

.round-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.round-item:hover {
    transform: translateY(-5px);
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

.retry-btn:hover {
    background: #0056b3;
}

/* Адаптивность */
@media (max-width: 1200px) {
    .rounds-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
    
    .details-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
}

@media (max-width: 768px) {
    .milestone-header {
        flex-direction: column;
        gap: 15px;
    }
    
    .header-actions {
        justify-content: flex-start;
        width: 100%;
    }
    
    .action-btn {
        flex: 1;
        min-width: auto;
    }
    
    .rounds-grid {
        grid-template-columns: 1fr;
    }
    
    .content-container {
        padding: 15px;
    }
    
    .milestone-details {
        padding: 20px;
    }
    
    .milestone-title {
        font-size: 1.8rem;
    }
}

@media (max-width: 480px) {
    .details-grid {
        grid-template-columns: 1fr;
    }
    
    .milestone-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .header-actions {
        flex-direction: column;
    }
    
    .action-btn {
        width: 100%;
    }
}
</style>