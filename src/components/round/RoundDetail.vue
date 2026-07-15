<template>
    <div class="round-detail-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            
            <!-- Детали Round -->
            <div class="round-details" v-if="round">
                <div class="round-header">
                    <div class="header-left">
                        <h1 class="round-title">Раунд: {{ round.name }}</h1>
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

                <div class="round-content">
                    <div class="details-grid">
                        <Field label="Состояние" :class="getStateClass()" :value= "getLocalizedRoundState()"/>
                        <Field
                          label="Отображен на экране"
                          :class="getToShowClass()"
                          :value="round.toShow ? 'Да' : 'Нет'"
                        />
                    </div>
                </div>
            </div>

            <!-- Панель судей и их статусов оценки -->
            <div class="judges-section" v-if="judgeRoundStatuses.length > 0">
                <div class="section-header">
                    <h2 class="section-title">Статусы оценок судей</h2>
                    <div class="judges-count">{{ judgeRoundStatuses.length }} судей</div>
                </div>

                <div class="judges-container">
                    <div class="judges-grid">
                        <div v-for="judgeRoundStatus in judgeRoundStatuses" 
                            :key="judgeRoundStatus.id" 
                            class="judge-item">
                            <div class="judge-info">
                                <span class="judge-name">{{ judgeRoundStatus.judge.value }}</span>
                            </div>
                            <div class="judge-status" :class="getStatusClass(judgeRoundStatus.status)">
                                <span v-if="judgeRoundStatus.status == 'READY'" class="status-icon">✓</span>
                                <span v-else class="status-icon pending">⏳</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Состояние пустого списка судей -->
            <div v-if="round && judgeRoundStatuses.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">👨‍⚖️</div>
                <h3>Нет назначенных судей</h3>
                <p>Для этого раунда еще не назначены судьи</p>
            </div>

            <!-- Участники раунда -->
            <div class="participants-section" v-if="round && !isLoading">
                <div class="section-header collapsible-header" @click="toggleParticipantsSection">
                    <h2 class="section-title">Участники</h2>
                    <div class="section-header-right">
                        <div class="participants-count">{{ contestants.length }}</div>
                        <span class="section-arrow">{{ participantsSectionOpen ? '▼' : '▶' }}</span>
                    </div>
                </div>

                <div v-if="participantsSectionOpen" class="section-content">
                    <div v-if="contestants.length === 0" class="empty-side">
                        Нет участников в этом раунде
                    </div>
                    <div v-else class="sides-grid">
                        <div class="side-column">
                            <div class="side-header">Партнеры</div>
                            <div class="contestants-list">
                                <div
                                    v-for="contestant in getLeaders(contestants)"
                                    :key="contestant.id"
                                    class="contestant-item"
                                >
                                    <span class="contestant-number">{{ contestant.number }}</span>
                                    <div class="contestant-participants">
                                        <span class="contestant-name">{{ formatParticipantName(contestant, 'LEADER') }}</span>
                                        <span
                                            v-for="assistant in getAssistants(contestant, 'LEADER')"
                                            :key="assistant.key"
                                            class="contestant-name assistant"
                                        >
                                            {{ formatAssistantName(assistant) }}
                                            <span class="assistant-label">(ассистент)</span>
                                        </span>
                                    </div>
                                </div>
                                <div v-if="getLeaders(contestants).length === 0" class="empty-side">
                                    Нет партнеров
                                </div>
                            </div>
                        </div>

                        <div class="side-column">
                            <div class="side-header">Партнерши</div>
                            <div class="contestants-list">
                                <div
                                    v-for="contestant in getFollowers(contestants)"
                                    :key="contestant.id"
                                    class="contestant-item"
                                >
                                    <span class="contestant-number">{{ contestant.number }}</span>
                                    <div class="contestant-participants">
                                        <span class="contestant-name">{{ formatParticipantName(contestant, 'FOLLOWER') }}</span>
                                        <span
                                            v-for="assistant in getAssistants(contestant, 'FOLLOWER')"
                                            :key="assistant.key"
                                            class="contestant-name assistant"
                                        >
                                            {{ formatAssistantName(assistant) }}
                                            <span class="assistant-label">(ассистент)</span>
                                        </span>
                                    </div>
                                </div>
                                <div v-if="getFollowers(contestants).length === 0" class="empty-side">
                                    Нет партнерш
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchRoundDetail">Попробовать снова</button>
            </div>
        </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { roundApi } from '@/services/roundApi.js';
import { judgeRoundStatusApi } from '@/services/judgeRoundStatusApi.js';
import { contestantApi } from '@/services/contestantApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { roundStateEnum } from '../../utils/EnumLocalizator.js';
import { useRouter } from 'vue-router';
import Field from '../common/Field.vue'
import { tournamentDisplayApi } from '@/services/tournamentDisplayApi.js'

export default {
  name: 'RoundDetail',
  components: {
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
      round: null,
      judgeRoundStatuses: [],
      contestants: [],
      participantsSectionOpen: false,
      isLoading: true,
      error: null
    }
  },

  async mounted() {
    await this.fetchRoundDetail();
    this.bindJudgeRoundReadyListener();
    // this.startAutoRefresh();
  },

  beforeUnmount() {
    this.unbindJudgeRoundReadyListener();
    this.stopAutoRefresh();
  },

  methods: {
    bindJudgeRoundReadyListener() {
      if (!window.$sse) return;
      this._onJudgeRoundNotification = ({ message }) => {
        this.handleJudgeRoundReadyNotification(message);
      };
      window.$sse.on('notification', this._onJudgeRoundNotification);
    },

    unbindJudgeRoundReadyListener() {
      if (!window.$sse || !this._onJudgeRoundNotification) return;
      window.$sse.off('notification', this._onJudgeRoundNotification);
      this._onJudgeRoundNotification = null;
    },

    handleJudgeRoundReadyNotification(message) {
      if (typeof message !== 'string' || !message.startsWith('{')) return;

      let payload;
      try {
        payload = JSON.parse(message);
      } catch {
        return;
      }

      if (payload?.type !== 'JUDGE_ROUND_READY') return;

      const currentRoundId = Number(this.round?.id || this.$route.params.roundId);
      const eventRoundId = Number(payload.roundId);
      const judgeId = Number(payload.judgeId);
      const status = payload.status;

      if (!currentRoundId || eventRoundId !== currentRoundId || !judgeId || !status) return;

      const target = this.judgeRoundStatuses.find(
        (item) => Number(item.judge?.id) === judgeId
      );
      if (target && target.status !== status) {
        target.status = status;
      }
    },

    async fetchRoundDetail() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const roundId = this.$route.params.roundId;
        await this.fillDetail(roundId);
      } catch (err) {
        this.error = 'Не удалось загрузить данные раунда';
        console.error('Error fetching round detail:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fillDetail(roundId) {
        this.round = await roundApi.getRoundDetail(roundId);
        const [judgeRoundStatuses, contestants] = await Promise.all([
          judgeRoundStatusApi.getJudgeRoundStatusesByRound(roundId),
          contestantApi.getByRoundByRoundId(roundId)
        ]);
        this.judgeRoundStatuses = judgeRoundStatuses || [];
        this.contestants = Array.isArray(contestants) ? contestants : [];
    },

    toggleParticipantsSection() {
      this.participantsSectionOpen = !this.participantsSectionOpen;
    },

    getLeaders(contestants) {
      return (contestants || []).filter((contestant) =>
        contestant.participants?.some((p) => p.partnerSide === 'LEADER')
      );
    },

    getFollowers(contestants) {
      return (contestants || []).filter((contestant) =>
        contestant.participants?.some((p) => p.partnerSide === 'FOLLOWER')
      );
    },

    formatParticipantName(contestant, partnerSide) {
      const participant = contestant.participants?.find((p) => p.partnerSide === partnerSide)
        || contestant.participants?.[0];
      if (!participant) return '';
      return [participant.surname, participant.name].filter(Boolean).join(' ');
    },

    getAssistants(contestant, partnerSide) {
      if (!contestant?.participants) return [];

      return contestant.participants
        .filter((participant) => {
          if (!participant?.assistant) return false;
          if (!partnerSide) return true;
          return participant.partnerSide === partnerSide;
        })
        .map((participant, index) => ({
          ...participant.assistant,
          key: `assistant_${participant.participantId || index}`
        }));
    },

    formatAssistantName(assistant) {
      const person = assistant?.person || assistant;
      return [person?.surname, person?.name].filter(Boolean).join(' ');
    },

    async refreshJudgeStatuses() {
      try {
        const roundId = this.$route.params.roundId;
        this.judgeRoundStatuses = await judgeRoundStatusApi.getJudgeRoundStatusesByRound(roundId);
      } catch (err) {
        console.error('Error refreshing judge statuses:', err);
        // Не показываем ошибку пользователю при автообновлении, только в консоль
      }
    },

    startAutoRefresh() {
      // Останавливаем предыдущий интервал, если он был
      this.stopAutoRefresh();
      
      // Запускаем новый интервал каждые 10 секунд
      this.refreshInterval = setInterval(() => {
        this.refreshJudgeStatuses();
      }, 5000);
    },

    // Метод для остановки автообновления
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },

    getLocalizedRoundState() {
        return roundStateEnum[this.round.state];
    },

    formatDate(dateString) {
      if (!dateString) return 'Не указана';
      return new Date(dateString).toLocaleDateString('ru-RU');
    },

    getStatusClass(status) {
      return status == 'READY' ? 'status-evaluated' : 'status-pending';
    },

    getHeaderActions() {
      if (!this.round) return [];

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const role = userInfo?.roles?.[0];

      const actions = [
          {
              label: 'Показать участников на экране',
              class: 'default-action-btn',
              onClick: () => this.showContestantToDisplay(),
              visible: role === 'SUPERADMIN' && this.round.toShow != true
          },
          {
              label: 'Скрыть участников с экрана',
              class: 'default-action-btn',
              onClick: () => this.showContestantFromDisplay(),
              visible: role === 'SUPERADMIN' && this.round.toShow === true
          },
      ];

      return actions.filter(action => action.visible);
    },

    async showContestantToDisplay() {
      const request = {
        roundId: this.round.id,
        toShow: true
      }
      await tournamentDisplayApi.updateDisplay(request);
      this.fillDetail(this.round.id);
    },

    async showContestantFromDisplay() {
      const request = {
        roundId: this.round.id,
        toShow: false
      }
      await tournamentDisplayApi.updateDisplay(request);
      this.fillDetail(this.round.id);
    },

    getStateClass() {
      const stateClasses = {
        'OPENED': 'status-opened',
        'CLOSED': 'status-closed',
      };
      return stateClasses[this.round.state] || 'status-unknown';
    },

    getToShowClass() {
      return this.round.toShow ? 'status-closed' : 'status-unknown';
    },

    handleRefresh() {
        window.location.reload();
    },
  },

  watch: {
    '$route.params.roundId': {
      handler() {
        this.fetchRoundDetail();
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

.round-detail-page {
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

/* Стили для деталей Round */
.round-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
}

.round-header {
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

.round-title {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
    line-height: 1.2;
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

/* Стили для секции судей */
.judges-section {
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

.judges-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.judges-container {
    position: relative;
}

.judges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.judge-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
}

.judge-item:hover {
    background: #e9ecef;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.judge-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.judge-name {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
}

.judge-role {
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
}

.judge-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-weight: bold;
}

.status-evaluated {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-pending {
    background: #fff3e0;
    color: #f57c00;
}

.status-icon {
    font-size: 1.2rem;
}

.status-icon.pending {
    font-size: 0.9rem;
}

/* Участники раунда */
.participants-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 25px;
    margin-top: 30px;
}

.collapsible-header {
    cursor: pointer;
    user-select: none;
    margin-bottom: 0;
}

.collapsible-header:hover {
    background: #fafafa;
    border-radius: 8px;
    margin: -8px -8px 0;
    padding: 8px 8px 15px;
}

.section-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.participants-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.section-arrow {
    font-size: 1rem;
    color: #6c757d;
}

.section-content {
    margin-top: 20px;
}

.sides-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.side-header {
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
}

.contestants-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.contestant-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
}

.contestant-number {
    font-weight: 700;
    color: #17a2b8;
    min-width: 2.5em;
    padding-top: 1px;
}

.contestant-participants {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
}

.contestant-name {
    color: #333;
}

.contestant-name.assistant {
    color: #666;
    font-size: 0.92em;
}

.assistant-label {
    color: #999;
    font-size: 0.9em;
}

.empty-side {
    color: #999;
    font-size: 0.95rem;
    padding: 8px 0;
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

@media (max-width: 768px) {
    .sides-grid {
        grid-template-columns: 1fr;
    }
}
</style>