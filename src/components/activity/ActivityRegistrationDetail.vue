<template>
    <div class="activity-detail-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
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
                            <span class="activity-date">{{ formatDate(activity.startDateTime) }} - {{ formatDate(activity.endDateTime) }}</span>
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
                            <label class="detail-label">Описание:</label>
                            <p class="detail-value">{{ activity.description || 'Нет описания' }}</p>
                        </div>

                        <div class="detail-item">
                            <label class="detail-label">Состояние:</label>
                            <p class="detail-value">{{ getLocalizedActivityState() || 'Не указан' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Секция участников -->
            <div class="participants-section">
                <div class="tabs-container">
                    <div class="tabs-header">
                        <button 
                            class="tab-button" 
                            :class="{ active: activeTab === 'leaders' }"
                            @click="switchTab('leaders')"
                        >
                            Партнеры ({{ leadersRegistrationStats }})
                        </button>
                        <button 
                            class="tab-button" 
                            :class="{ active: activeTab === 'followers' }"
                            @click="switchTab('followers')"
                        >
                            Партнерши ({{ followersRegistrationStats }})
                        </button>
                    </div>

                    <div class="tab-content">
                        <!-- Таб Партнеры -->
                        <ParticipantsTab 
                            v-if="activeTab === 'leaders'"
                            :participants="leaders"
                            :selectedParticipants="selectedParticipants"
                            :showActionPanel="showActionPanel"
                            :isLoading="isLoading"
                            tabTitle="Партнеры"
                            emptyIcon="👨"
                            emptyTitle="Нет партнеров"
                            emptyDescription="Для этой активности еще не добавлены партнеры"
                            @update:selectedParticipants="updateSelectedParticipants"
                            @openRegisterModal="openRegisterModal"
                            @unregisterSingleParticipant="unregisterSingleParticipant"
                            @toggleSelectAll="toggleSelectAllLeaders"
                        />

                        <!-- Таб Партнерши -->
                        <ParticipantsTab 
                            v-if="activeTab === 'followers'"
                            :participants="followers"
                            :selectedParticipants="selectedParticipants"
                            :showActionPanel="showActionPanel"
                            :isLoading="isLoading"
                            tabTitle="Партнерши"
                            emptyIcon="👩"
                            emptyTitle="Нет партнерш"
                            emptyDescription="Для этой активности еще не добавлены партнерши"
                            @update:selectedParticipants="updateSelectedParticipants"
                            @openRegisterModal="openRegisterModal"
                            @unregisterSingleParticipant="unregisterSingleParticipant"
                            @toggleSelectAll="toggleSelectAllFollowers"
                        />
                    </div>
                </div>

                <!-- Панель действий с выбранными участниками -->
                <div class="selection-actions" v-if="showActionPanel">
                    <div class="selected-count">
                        Выбрано: {{ selectedParticipants.length }}
                    </div>
                    <div class="action-buttons">
                        <button 
                            class="action-btn primary-btn" 
                            @click="changeActivity"
                            :disabled="selectedParticipants.length !== 1"
                        >
                            Изменить активность
                        </button>
                        <button 
                            class="action-btn success-btn" 
                            @click="openAddParticipantModal"
                        >
                            Добавить участника
                        </button>
                    </div>
                </div>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchActivityDetail">Попробовать снова</button>
            </div>
        </div>

        <!-- Модальное окно регистрации -->
        <RegisterModal
            ref="registerModal"
            :participant="selectedParticipantForModal"
            :show="showRegisterModal"
            @close="closeRegisterModal"
            @confirm="confirmRegistration"
        />

        <!-- Модальное окно добавления участника -->
        <AddParticipantModal
            :show="showAddParticipantModal"
            :activityId="activity?.id"
            :withAssistant="!!activity?.withAssistant"
            @close="closeAddParticipantModal"
            @add="addNewParticipant"
        />

        <ChangeActivityModal
            :show="showChangeActivityModal"
            :currentActivityId="activity?.id"
            :currentActivityName="activity?.name"
            :participantId="selectedParticipantForChange?.id"
            :occasionId="activity?.occasion?.id"
            @close="closeChangeActivityModal"
            @change="changeParticipantActivity"
        />
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { activityApi } from '@/services/activityApi.js';
import { participantApi } from '@/services/participantApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { activityStateEnum, partnerSideEnum } from '../../utils/EnumLocalizator.js';
import { useRouter } from 'vue-router';
import ParticipantsTab from '../participant/ParticipantsTab.vue';
import RegisterModal from './RegisterModal.vue';
import AddParticipantModal from '../participant/AddParticipantModal.vue';
import ChangeActivityModal from './ChangeActivityModal.vue';

export default {
  name: 'ActivityRegistrationDetail',
  components: {
    ControlPanel,
    UserIcon,
    LoadingOverlay,
    ParticipantsTab,
    RegisterModal,
    AddParticipantModal,
    ChangeActivityModal,
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
      isLoading: true,
      error: null,
      participants: [],
      selectedParticipants: [],
      selectAll: false,
      activeTab: 'leaders',
      selectAllLeaders: false,
      selectAllFollowers: false,
      showRegisterModal: false,
      selectedParticipantForModal: null,
      showAddParticipantModal: false,
      participantNumber: '',
      numberError: '',
      showChangeActivityModal: false,
      selectedParticipantForChange: null
    }
  },

  computed: {
    leaders() {
        return this.participants.filter(p => p.partnerSide === 'LEADER');
    },

    followers() {
        return this.participants.filter(p => p.partnerSide === 'FOLLOWER');
    },

    leadersRegistrationStats() {
        const registeredCount = this.leaders.filter(p => p.isRegistered).length;
        const totalCount = this.leaders.length;
        return `Зарегистрировано ${registeredCount} из ${totalCount}`;
    },

    followersRegistrationStats() {
        const registeredCount = this.followers.filter(p => p.isRegistered).length;
        const totalCount = this.followers.length;
        return `Зарегистрировано ${registeredCount} из ${totalCount}`;
    },

    showActionPanel() {
        return this.activity && this.activity.state === 'PLANNED';
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
        await this.fillDetail(activityId);
      } catch (err) {
        this.error = 'Не удалось загрузить данные активности';
        console.error('Error fetching activity detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fillDetail(activityId) {
        this.activity = await activityApi.getActivityDetail(activityId);
        this.participants = await participantApi.getParticipantsByActivity(activityId);
    },

    // Новый метод для переключения табов с очисткой выделения
    switchTab(tabName) {
      // Очищаем выделение при переключении табов
      this.selectedParticipants = [];
      this.selectAllLeaders = false;
      this.selectAllFollowers = false;
      this.selectAll = false;
      this.activeTab = tabName;
    },

    changeActivity() {
        if (this.selectedParticipants.length === 1) {
            const selectedParticipantId = this.selectedParticipants[0];
            this.selectedParticipantForChange = this.participants.find(p => p.id === selectedParticipantId);
            this.showChangeActivityModal = true;
        }
    },

    closeChangeActivityModal() {
        this.showChangeActivityModal = false;
        this.selectedParticipantForChange = null;
    },

    async changeParticipantActivity(changeData) {
        try {
            // Вызов API для изменения активности участника
            const result = await participantApi.changeParticipantActivity(
                changeData.participantId,
                changeData.newActivityId
            );
            
            if (result) {
                // Обновляем список участников
                await this.fillDetail(this.activity.id);
                this.closeChangeActivityModal();
                // Очищаем выделение
                this.selectedParticipants = [];
            }
        } catch (error) {
            console.error('Error changing participant activity:', error);
            // TODO: Показать сообщение об ошибке
        }
    },

    getFullName(participant) {
      return `${participant?.person?.surname} ${participant?.person?.name} ${participant?.person?.secondName || ''}`.trim();
    },

    getEmail(participant) {
        return participant?.person?.email || 'Не указан';
    },

    getPhoneNumber(participant) {
        return participant?.person?.phoneNumber || 'Не указан';
    },

    getPartnerSideDisplay(partnerSide) {
        return partnerSideEnum[partnerSide] || partnerSide;
    },

    getPartnerSideClass(partnerSide) {
      const classes = {
        'LEADER': 'internal',
        'FOLLOWER': 'external',
      };
      return classes[partnerSide] || 'unknown';
    },

    handleRefresh() {
        window.location.reload();
    },

    toggleSelectAllLeaders() {
        if (this.selectAllLeaders) {
            const leaderIds = this.leaders.map(p => p.id);
            this.selectedParticipants = [...new Set([...this.selectedParticipants, ...leaderIds])];
        } else {
            const leaderIds = this.leaders.map(p => p.id);
            this.selectedParticipants = this.selectedParticipants.filter(id => !leaderIds.includes(id));
        }
    },

    toggleSelectAllFollowers() {
        if (this.selectAllFollowers) {
            const followerIds = this.followers.map(p => p.id);
            this.selectedParticipants = [...new Set([...this.selectedParticipants, ...followerIds])];
        } else {
            const followerIds = this.followers.map(p => p.id);
            this.selectedParticipants = this.selectedParticipants.filter(id => !followerIds.includes(id));
        }
    },

    updateSelectedParticipants(newSelected) {
        // Ограничиваем выбор только одной записью
        if (newSelected.length > 1) {
            // Оставляем только последнюю выбранную запись
            this.selectedParticipants = [newSelected[newSelected.length - 1]];
        } else {
            this.selectedParticipants = newSelected;
        }
    },

    openRegisterModal(participant) {
        this.selectedParticipantForModal = participant;
        this.showRegisterModal = true;
    },

    closeRegisterModal() {
        this.showRegisterModal = false;
        this.selectedParticipantForModal = null;
    },

    // Методы для модального окна добавления участника
    openAddParticipantModal() {
        this.showAddParticipantModal = true;
    },

    closeAddParticipantModal() {
        this.showAddParticipantModal = false;
    },

    async addNewParticipant(newParticipantData) {
        try {
            // Добавляем нового участника через API
            const result = await participantApi.addParticipantToActivity(
                newParticipantData
            );
            
            if (result) {
                // Обновляем список участников
                await this.fillDetail(this.activity.id);
                this.closeAddParticipantModal();
            }
        } catch (error) {
            console.error('Error adding participant:', error);
            // TODO: Показать сообщение об ошибке
        }
    },

    validateNumber(participantNumber) {
        if (!participantNumber.trim()) {
            return false;
        }
        
        // Проверка на уникальность номера в рамках активности
        const isNumberTaken = this.participants.some(p => 
            p.number === participantNumber && 
            p.id !== this.selectedParticipantForModal.id
        );
        
        return !isNumberTaken;
    },

    async confirmRegistration(participantNumber) {
        // Проверяем уникальность номера
        const isNumberValid = this.validateNumber(participantNumber);
        
        if (!isNumberValid) {
            // Передаем ошибку в модальное окно через событие
            this.$refs.registerModal.setNumberError('Этот номер уже занят другим участником');
            return;
        }

        try {
            const updateResult = await participantApi.registerParticipant(
                this.selectedParticipantForModal.id, 
                participantNumber
            );
            
            if (updateResult) {
                this.selectedParticipantForModal.isRegistered = true;
                this.selectedParticipantForModal.number = updateResult.number;
                this.closeRegisterModal();
            }
        } catch (error) {
            console.error('Error registering participant:', error);
            this.$refs.registerModal.setNumberError('Ошибка при регистрации участника');
        }
    },

    async unregisterSingleParticipant(participant) {
        try {
            const updateResult = await participantApi.unregisterParticipants(participant.id);
            if (updateResult) {
                participant.isRegistered = false;
                participant.number = undefined;
            }
        } catch (error) {
            console.error('Error unregistering participant:', error);
        }
    },

    getLocalizedActivityState() {
        return activityStateEnum[this.activity.state];
    },

    formatDate(dateString) {
      if (!dateString) return 'Не указана';
      return new Date(dateString).toLocaleDateString('ru-RU');
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
          visible: this.activity.state === 'IN_PROGRESS' && role === 'SUPERADMIN'
        },
        {
          label: 'Завершить активность',
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

    async sumUpActivity() {
        await activityApi.sumUpActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async completeActivity() {
        await activityApi.completeActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    }
  },

  watch: {
    '$route.params.activityId': {
      handler() {
        this.fetchActivityDetail();
      },
      immediate: false
    },

    selectedParticipants: {
        handler(newVal) {
            const leaderIds = this.leaders.map(p => p.id);
            this.selectAllLeaders = leaderIds.length > 0 && leaderIds.every(id => newVal.includes(id));
            
            const followerIds = this.followers.map(p => p.id);
            this.selectAllFollowers = followerIds.length > 0 && followerIds.every(id => newVal.includes(id));
            
            this.selectAll = newVal.length === this.participants.length && this.participants.length > 0;
        }
    }
  },
}
</script>

<style scoped>
/* Стили остаются без изменений */
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

.activity-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
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

.primary-btn {
    background: #007bff;
    color: white;
}

.primary-btn:hover:not(:disabled) {
    background: #0056b3;
}

.success-btn {
    background: #28a745;
    color: white;
}

.success-btn:hover:not(:disabled) {
    background: #218838;
}

.warning-btn {
    background: #ffc107;
    color: #212529;
}

.warning-btn:hover:not(:disabled) {
    background: #e0a800;
}

.small-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    min-width: 60px;
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

.error-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-top: 20px;
}

.error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.error-state h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

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

.participants-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px;
}

.selection-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    margin-top: 20px;
}

.selected-count {
    font-weight: 500;
    color: #333;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.action-btn:disabled:hover {
    background: inherit;
    color: inherit;
}

.tabs-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.tab-button {
    flex: 1;
    padding: 15px 20px;
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 2px solid transparent;
}

.tab-button:hover {
    background: #e9ecef;
    color: #333;
}

.tab-button.active {
    color: #007bff;
    border-bottom-color: #007bff;
    background: white;
}

.tab-content {
    background: white;
}
</style>