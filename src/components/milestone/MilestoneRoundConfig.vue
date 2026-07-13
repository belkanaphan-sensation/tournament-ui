<template>
  <div class="milestone-round-config-page">
    <div class="header-container control-panel-background-container">
      <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
      <UserIcon/>
    </div>

    <div class="content-container">
      <LoadingOverlay :isLoading="isLoading" />

      <div class="milestone-details" v-if="milestone">
        <div class="milestone-header">
          <div class="header-left">
            <h1 class="milestone-title">Этап: {{ milestone.name }}</h1>
          </div>
          <div class="header-actions">
            <button
              type="button"
              class="action-btn default-action-btn"
              @click="openAddParticipantModal"
            >
              Добавить участника
            </button>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && rounds.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>Нет раундов</h3>
        <p>Для этого этапа еще не добавлены раунды</p>
      </div>

      <div v-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Ошибка загрузки</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadData">Попробовать снова</button>
      </div>

      <div class="rounds-list" v-if="rounds.length > 0">
        <div
          v-for="roundPanel in rounds"
          :key="roundPanel.round.id"
          class="collapsible-section"
        >
          <div class="section-header" @click="toggleRound(roundPanel.round.id)">
            <span class="section-title">{{ roundPanel.round.name }}</span>
            <span class="section-arrow">{{ isRoundOpen(roundPanel.round.id) ? '▼' : '▶' }}</span>
          </div>

          <div v-if="isRoundOpen(roundPanel.round.id)" class="section-content">
            <div class="sides-grid">
              <div class="side-column">
                <div class="side-header">Партнеры</div>
                <div class="contestants-list">
                  <div
                    v-for="contestant in getLeaders(roundPanel.contestants)"
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
                    <CardMenu :actions="getContestantMenuActions(contestant, roundPanel.round, 'LEADER')" />
                  </div>
                  <div v-if="getLeaders(roundPanel.contestants).length === 0" class="empty-side">
                    Нет партнеров
                  </div>
                </div>
              </div>

              <div class="side-column">
                <div class="side-header">Партнерши</div>
                <div class="contestants-list">
                  <div
                    v-for="contestant in getFollowers(roundPanel.contestants)"
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
                    <CardMenu :actions="getContestantMenuActions(contestant, roundPanel.round, 'FOLLOWER')" />
                  </div>
                  <div v-if="getFollowers(roundPanel.contestants).length === 0" class="empty-side">
                    Нет партнерш
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ContestantRoundMoveModal
      v-if="showRoundActionModal"
      :show="showRoundActionModal"
      :milestone-id="milestone?.id"
      :contestant="roundActionContext.contestant"
      :source-round="roundActionContext.round"
      :contestant-label="roundActionContext.label"
      @close="closeRoundActionModal"
      @confirm="handleRoundActionConfirm"
    />

    <ParticipantRoundAddModal
      v-if="showAddParticipantModal"
      :show="showAddParticipantModal"
      :milestone-id="milestone?.id"
      @close="closeAddParticipantModal"
      @confirm="handleAddParticipantConfirm"
    />

    <ContestantRoundRemoveModal
      v-if="showRemoveModal"
      :show="showRemoveModal"
      :participant-label="removeContext.label"
      :round-name="removeContext.roundName"
      @cancel="closeRemoveModal"
      @confirm="handleRemoveConfirm"
    />
  </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import CardMenu from '../common/CardMenu.vue';
import ContestantRoundMoveModal from './ContestantRoundMoveModal.vue';
import ParticipantRoundAddModal from './ParticipantRoundAddModal.vue';
import ContestantRoundRemoveModal from './ContestantRoundRemoveModal.vue';
import { roundApi } from '@/services/roundApi.js';
import { contestantApi } from '@/services/contestantApi.js';
import { milestoneApi } from '@/services/milestoneApi.js';
import { useRouter } from 'vue-router';

export default {
  name: 'MilestoneRoundConfig',
  components: {
    ControlPanel,
    UserIcon,
    LoadingOverlay,
    CardMenu,
    ContestantRoundMoveModal,
    ParticipantRoundAddModal,
    ContestantRoundRemoveModal
  },

  setup() {
    const router = useRouter();
    const handleBack = () => {
      router.go(-1);
    };

    return {
      handleBack
    };
  },

  data() {
    return {
      isLoading: true,
      error: null,
      milestone: null,
      rounds: [],
      openRoundIds: new Set(),
      showRoundActionModal: false,
      showAddParticipantModal: false,
      showRemoveModal: false,
      roundActionContext: {
        contestant: null,
        round: null,
        partnerSide: null,
        label: ''
      },
      removeContext: {
        contestant: null,
        round: null,
        label: '',
        roundName: ''
      }
    };
  },

  async mounted() {
    await this.loadData();
  },

  methods: {
    handleRefresh() {
      window.location.reload();
    },

    async loadData() {
      this.isLoading = true;
      this.error = null;

      try {
        const milestoneId = this.$route.params.milestoneId;
        const [milestone, rounds] = await Promise.all([
          milestoneApi.getMilestoneDetail(milestoneId),
          roundApi.getRounds(milestoneId)
        ]);

        this.milestone = milestone;
        const sortedRounds = [...(rounds || [])].sort((a, b) => (a.roundOrder ?? 0) - (b.roundOrder ?? 0));

        const panels = await Promise.all(
          sortedRounds.map(async (round) => {
            const contestants = await contestantApi.getByRoundByRoundId(round.id) || [];
            return {
              round,
              contestants: Array.isArray(contestants) ? contestants : []
            };
          })
        );

        this.rounds = panels;
        this.openRoundIds = new Set();
      } catch (err) {
        this.error = 'Не удалось загрузить раунды и участников';
        console.error('Error loading milestone round config:', err);
      } finally {
        this.isLoading = false;
      }
    },

    isRoundOpen(roundId) {
      return this.openRoundIds.has(roundId);
    },

    toggleRound(roundId) {
      const next = new Set(this.openRoundIds);
      if (next.has(roundId)) {
        next.delete(roundId);
      } else {
        next.add(roundId);
      }
      this.openRoundIds = next;
    },

    getContestantMenuActions(contestant, round, partnerSide) {
      const actions = [
        {
          label: 'Переместить в раунд',
          onClick: () => this.openRoundActionModal(contestant, round, partnerSide),
          visible: true
        },
        {
          label: 'Удалить из раунда',
          onClick: () => this.openRemoveModal(contestant, round, partnerSide),
          visible: true
        }
      ];

      return actions.filter(action => action.visible);
    },

    openRoundActionModal(contestant, round, partnerSide) {
      this.roundActionContext = {
        contestant,
        round,
        partnerSide,
        label: [
          contestant?.number,
          this.formatParticipantName(contestant, partnerSide)
        ].filter(Boolean).join(' ')
      };
      this.showRoundActionModal = true;
    },

    closeRoundActionModal() {
      this.showRoundActionModal = false;
    },

    async handleRoundActionConfirm({ fromRoundId, toRoundId, contestantId }) {
      try {
        await roundApi.moveContestant(fromRoundId, contestantId, toRoundId);
        this.closeRoundActionModal();
        await this.loadData();
      } catch (error) {
        console.error('Failed to move contestant:', error);
      }
    },

    openRemoveModal(contestant, round, partnerSide) {
      this.removeContext = {
        contestant,
        round,
        label: [
          contestant?.number,
          this.formatParticipantName(contestant, partnerSide)
        ].filter(Boolean).join(' '),
        roundName: round?.name || ''
      };
      this.showRemoveModal = true;
    },

    closeRemoveModal() {
      this.showRemoveModal = false;
    },

    async handleRemoveConfirm() {
      const contestant = this.removeContext.contestant;
      const round = this.removeContext.round;
      if (!contestant?.id || !round?.id) {
        this.closeRemoveModal();
        return;
      }

      try {
        await roundApi.removeContestant(round.id, contestant.id);
        this.closeRemoveModal();
        await this.loadData();
      } catch (error) {
        console.error('Failed to remove contestant:', error);
      }
    },

    openAddParticipantModal() {
      this.showAddParticipantModal = true;
    },

    closeAddParticipantModal() {
      this.showAddParticipantModal = false;
    },

    async handleAddParticipantConfirm({ participantId, toRoundId }) {
      try {
        await roundApi.addContestant(toRoundId, [participantId]);
        this.closeAddParticipantModal();
        await this.loadData();
      } catch (error) {
        console.error('Failed to add participant to round:', error);
      }
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
    }
  }
}
</script>

<style scoped>
.milestone-round-config-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-family: Arial, sans-serif;
}

.header-container {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

.milestone-details {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  margin: 0;
  line-height: 1.2;
}

.rounds-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.collapsible-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 18px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  user-select: none;
}

.section-header:hover {
  background: #fafafa;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.section-arrow {
  font-size: 1rem;
  color: #6c757d;
}

.section-content {
  padding: 20px 24px 24px;
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

.empty-state,
.error-state {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.empty-icon,
.error-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #17a2b8;
  color: white;
  cursor: pointer;
}

.retry-btn:hover {
  background: #1abdd6;
}

@media (max-width: 768px) {
  .sides-grid {
    grid-template-columns: 1fr;
  }
}
</style>
