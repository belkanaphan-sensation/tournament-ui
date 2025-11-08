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
                <div class="section-header">
                    <h2 class="section-title">Участники</h2>
                    <div class="participants-count">{{ participants.length }} участников</div>
                </div>

                <div class="participants-table-container">
                    <table class="participants-table">
                        <thead>
                            <tr>
                                <th class="selection-column">
                                    <input 
                                        type="checkbox" 
                                        v-model="selectAll"
                                        @change="toggleSelectAll"
                                    >
                                </th>
                                <th>ФИО</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Номер</th>
                                <th>Сторона</th>
                                <th>Статус регистрации</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr 
                                v-for="participant in participants" 
                                :key="participant.id"
                                :class="{ 'selected': selectedParticipants.includes(participant.id) }"
                            >
                                <td class="selection-column">
                                <input 
                                    type="checkbox" 
                                    :value="participant.id"
                                    v-model="selectedParticipants"
                                >
                                </td>
                                <td>
                                <div class="participant-name">
                                    {{ getFullName(participant) }}
                                </div>
                                </td>
                                <td>{{ getEmail(participant)}}</td>
                                <td>{{ getPhoneNumber(participant)}}</td>
                                <td>
                                <input 
                                    v-if="canEditNumber(participant)"
                                    type="text"
                                    :value="participant.number"
                                    @input="handleNumberChange(participant, $event.target.value)"
                                    class="number-input"
                                    placeholder="Введите номер"
                                >
                                <span v-else>{{ participant.number || 'Не указан' }}</span>
                                </td>
                                <td>
                                <span class="partner-side-badge" :class="getPartnerSideClass(participant.partnerSide)">
                                    {{ getPartnerSideDisplay(participant.partnerSide) }}
                                </span>
                                </td>
                                <td>
                                <span class="registration-status" :class="participant.isRegistered ? 'registered' : 'not-registered'">
                                    {{ participant.isRegistered ? 'Зарегистрирован' : 'Не зарегистрирован' }}
                                </span>
                                </td>
                            </tr>
                            </tbody>
                    </table>
                    
                    <!-- Состояние пустого списка участников -->
                    <div v-if="participants.length === 0 && !isLoading" class="empty-participants">
                        <div class="empty-icon">👥</div>
                        <h3>Нет участников</h3>
                        <p>Для этой активности еще не добавлены участники</p>
                    </div>
                </div>

                <!-- Панель действий с выбранными участниками - всегда видима -->
                <div class="selection-actions" v-if="showActionPanel">
                    <div class="selected-count">
                        Выбрано: {{ selectedParticipants.length }}
                    </div>
                    <div class="action-buttons">
                        <button 
                            class="action-btn primary-btn" 
                            @click="registerSelected"
                            :disabled="!canRegisterSelected"
                        >
                            Зарегистрировать
                        </button>
                        <button 
                            class="action-btn warning-btn" 
                            @click="unregisterSelected"
                            :disabled="!canUnregisterSelected"
                        >
                            Отменить регистрацию
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

export default {
  name: 'ActivityRegistrationDetail',
  components: {
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
      activity: null,
      isLoading: true,
      error: null,
      participants: [],
      selectedParticipants: [],
      selectAll: false
    }
  },

  computed: {
    canRegisterSelected() {
      if (this.selectedParticipants.length === 0) return false;
        
        const selectedParticipants = this.participants.filter(p => 
        this.selectedParticipants.includes(p.id)
        );
        
        // Регистрация возможна только если ВСЕ выбранные участники незарегистрированы
        return selectedParticipants.length > 0 && 
            selectedParticipants.every(participant => !participant.isRegistered);
    },

    // Может ли быть отменена регистрация выбранных участников
    canUnregisterSelected() {
        if (this.selectedParticipants.length === 0) return false;
        
        const selectedParticipants = this.participants.filter(p => 
        this.selectedParticipants.includes(p.id)
        );
        
        // Отмена регистрации возможна только если ВСЕ выбранные участники зарегистрированы
        return selectedParticipants.length > 0 && 
            selectedParticipants.every(participant => participant.isRegistered);
    },

    // Показывать ли панель действий с кнопками
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

        this.participants = await participantApi.getParticipantsByActivity(activityId);

        // this.participants = [
        //   {
        //     id: 1,
        //     name: 'Иван',
        //     surname: 'Иванов',
        //     secondName: 'Иванович',
        //     email: 'ivanov@example.com',
        //     phoneNumber: '+7 (999) 123-45-67',
        //     number: '001',
        //     partnerSide: 'LEADER',
        //     isRegistered: true,
        //     activityId: activityId
        //   },
        //   {
        //     id: 2,
        //     name: 'Петр',
        //     surname: 'Петров',
        //     secondName: 'Петрович',
        //     email: 'petrov@example.com',
        //     phoneNumber: '+7 (999) 765-43-21',
        //     number: '002',
        //     partnerSide: 'LEADER',
        //     isRegistered: false,
        //     activityId: activityId
        //   },
        //   {
        //     id: 3,
        //     name: 'Мария',
        //     surname: 'Сидорова',
        //     secondName: 'Ивановna',
        //     email: 'sidorova@example.com',
        //     phoneNumber: '+7 (999) 555-55-55',
        //     number: '003',
        //     partnerSide: 'FOLLOWER',
        //     isRegistered: true,
        //     activityId: activityId
        //   }
        // ];
    },

    canEditNumber(participant) {
        return this.selectedParticipants.includes(participant.id) && !participant.isRegistered;
    },

    handleNumberChange(participant, newNumber) {
        participant.number = newNumber;
        // TODO: Сохранение через API
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

    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedParticipants = this.participants.map(p => p.id);
      } else {
        this.selectedParticipants = [];
      }
    },

    async registerSelected() {
        const selected = this.participants.filter(p => 
            this.selectedParticipants.includes(p.id) && !p.isRegistered
        );

        for (let i = 0; i < selected.length; i++) {
            selected[i].isRegistered = true;
            await participantApi.registerParticipant(selected[i].id, selected[i].number);
        }

        this.selectedParticipants = [];
        this.selectAll = false;
    },

    async unregisterSelected() {
      const selected = this.participants.filter(p => 
        this.selectedParticipants.includes(p.id) && p.isRegistered
      );

      for (let i = 0; i < selected.length; i++) {
            selected[i].isRegistered = false;
            await participantApi.unregisterParticipants(selected[i].id);
      }
      
      this.selectedParticipants = [];
      this.selectAll = false;
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

    async sumUpActivity() {
        await activityApi.sumUpActivity(this.activity.id);
        this.fillDetail(this.activity.id);
    },

    async completeActivity() {
        await activityApi.completeActivity(this.activity.id);
        this.fillDetail(this.activity.id);
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
            this.selectAll = newVal.length === this.participants.length && this.participants.length > 0;
        }
        }
    }
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
    max-width: 1200px;
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

.primary-btn {
    background: #007bff;
    color: white;
}

.primary-btn:hover:not(:disabled) {
    background: #0056b3;
}

.warning-btn {
    background: #ffc107;
    color: #212529;
}

.warning-btn:hover:not(:disabled) {
    background: #e0a800;
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

/* Стили для пустой секции */
.empty-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px;
    min-height: 200px;
    /* Содержимое будет добавлено позже */
}

/* Состояния пустого списка и ошибки */
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

.participants-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.participants-table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.participants-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.participants-table th,
.participants-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
}

.participants-table td:nth-child(7) { /* Колонка статуса регистрации */
    white-space: normal;
    min-width: 150px;
}

.participants-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.participants-table tbody tr:hover {
    background: #f8f9fa;
}

.participants-table tbody tr.selected {
    background: #e3f2fd;
}

.selection-column {
    width: 40px;
    text-align: center;
}

.selection-column input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.participant-name {
    font-weight: 500;
    color: #333;
}

.partner-side-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.partner-side-badge.internal {
    background: #e3f2fd;
    color: #1976d2;
}

.partner-side-badge.external {
    background: #fff3e0;
    color: #f57c00;
}

.partner-side-badge.partner {
    background: #e8f5e8;
    color: #2e7d32;
}

.partner-side-badge.unknown {
    background: #f5f5f5;
    color: #666;
}

.registration-status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    display: inline-block;
    min-width: 140px;
    text-align: center;
    box-sizing: border-box;
}

.registration-status.registered {
    background: #e8f5e8;
    color: #2e7d32;
}

.registration-status.not-registered {
    background: #ffebee;
    color: #c62828;
}

/* Панель действий с выбранными участниками - всегда видима */
.selection-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.selected-count {
    font-weight: 500;
    color: #333;
}

.action-buttons {
    display: flex;
    gap: 10px;
}

/* Состояние пустого списка участников */
.empty-participants {
    text-align: center;
    padding: 60px 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.empty-participants .empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.empty-participants h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.3rem;
}

.empty-participants p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
}

.number-input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 80px;
}

.number-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
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
</style>