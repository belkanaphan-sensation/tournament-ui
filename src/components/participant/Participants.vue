<template>

    <!-- Control panel -->
    <div class="header-container control-panel-background-container">
        <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
        <UserIcon/>
    </div>

    <div class="title-container">
      <span> Участники на оценку </span>
    </div>

    <div class="content-container" :class="{'disabled-container': roundResultStatus === 'READY'}">
      <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка участников...</p>
      </div>

      <div v-if="participants.length === 0 && !isLoading" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Нет данных для отображения</h3>
        <p>Здесь появятся участники на оценку, когда они будут добавлены</p>
      </div>

      <div v-for="(participant, index) in participants" :key="index">
        <div class="test-mask">
          <ParticipantCard 
            :participantId="participant.id"
            :participantNumber="participant.number"
            :criteria="criteria" 
            :roundId="Number(this.roundId)"/>
          <Mask v-if="roundResultStatus === 'READY'" />
        </div> 
      </div>

      <div class="action-container">
        <button v-if="!roundResultStatus || roundResultStatus == '' || roundResultStatus === 'NOT_READY'"
          class="button"
          @click="toReadyRoundResultStatus"
        > Готово </button>

        <button v-if="roundResultStatus === 'READY'"
          class="button edit-button"
          @click="backToNotReadyRoundResultStatus"
        > Редактировать </button>
      </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import Mask from '../common/Mask.vue';
import Field from '../common/Field.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import ParticipantCard from './ParticipantCard.vue';
import { useRouter } from 'vue-router'
import { participantApi } from '@/services/participantApi.js';
import { criteriaApi } from '@/services/criteriaApi.js';
import { judgeResultApi } from '@/services/judgeResultApi.js';
import { milestoneRuleApi } from '@/services/milestoneRuleApi.js';
import { roundResultStatusApi } from '@/services/roundResultStatusApi.js';
import { useJudgeResultStore } from '../../store/JudgeResultStore.js';

export default {
  name: 'Milestones',

  components: {
    ControlPanel,
    UserIcon,
    Field,
    ParticipantCard,
    Mask
  },

  props: {
    roundId: {
      type: Number,
      default: undefined
    },
    milestoneId: {
      type: Number,
      default: undefined
    },
  },

  setup(props) {
    const router = useRouter();

    const handleBack = () => {
      router.go(-1);
    }

    return {
      handleBack,
    }
  },

  async mounted() {
    this.isLoading = true;
    try {
      this.participants = await this.fetchParticipants(this.roundId) || [];
      this.milestoneRule = await this.fetchMilesoneRule(this.milestoneId) || {};
      this.criteria = await this.fetchCriteria() || [];
      this.roundResults = await this.fetchJudgeRoundResults() || [];
      this.roundResultStatus = await this.fetchRoundResultStatus();
      this.updateLocalStorageRoundResults();
      // this.roundResult = await this.fetchParticipantRoundResultByRoundId(this.roundId) || [];
      const t = '';
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
    async backToNotReadyRoundResultStatus() {
      this.roundResultStatus = 'NOT_READY';
    },

    async toReadyRoundResultStatus() {
      const resultStore = useJudgeResultStore();
      this.roundResults = await this.pushRawResult(resultStore.getRoundResultFlat(this.roundId));
      if (this.roundResults) {
        resultStore.clearByRoundId(this.roundId);
        this.updateLocalStorageRoundResults();
      }
      
      this.roundResultStatus = await this.fetchRoundResultStatus();
    },

    async pushRawResult(judgeMilestoneResultRoundRequests) {
      return judgeResultApi.pushRawResult(judgeMilestoneResultRoundRequests);
    },

    async fetchRoundResultStatus() {
      return roundResultStatusApi.getRoundResultStatus(this.roundId);
    },

    async fetchParticipants() {
        return participantApi.getParticipantsByRoundId(this.roundId);
    },

    async fetchMilesoneRule() {
      return milestoneRuleApi.getMilestoneRuleByMilestoneId(this.milestoneId);
    },

    async fetchCriteria(milestoneId) {
        return criteriaApi.getCriteriaByMilestoneId(this.milestoneRule.id);
    },

    async fetchJudgeRoundResults() {
        return judgeResultApi.getJudgeRoundResult(this.roundId);
    },

    updateLocalStorageRoundResults() {
      if (this.roundResults && this.roundResults.length > 0) {
        const resultStore = useJudgeResultStore();
        const allResults = resultStore.getAll();
        if (allResults) {
          for (let i = 0; i < this.roundResults.length; i++) {
            let r = this.roundResults[i];
            if (!resultStore.hasResult(r.round.id, r.milestoneCriteria.id,r.participant.id)) {
              resultStore.setResult(r.round.id, r.milestoneCriteria.id,r.participant.id, r.score, r.isCandidate, r.id);
            }
          }
        }
      }
    },

    async handleRefresh() {
      const resultStore = useJudgeResultStore();
      resultStore.clear();
      this.roundResults = await this.fetchJudgeRoundResults() || [];
      this.updateLocalStorageRoundResults();
    },
  },

  data() {
    return {
        isLoading: true,
        participants: [],
        criteria: [],
        criteriaMode: undefined,
        roundResult: [],
        roundResultStatus: undefined,
    }
  },
}
</script>

<style scoped>
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    width: 100%;
  }

  .progress-container {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #42b883;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 14px;
    font-weight: 500;
    color: #666;
  }

  .action-container {
    padding: 6px;
    display: flex;
    justify-content: center;
  }

  .button {
    padding: 10px 20px;
    border: 2px solid #2e86de;
    background: #2e86de;
    color: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none;
  }

  .edit-button:hover {
    /* background: #1b6bc1;
    border-color: #1b6bc1;
    transform: translateY(-1px); */
  }

  .edit-button {
    background: #ff9f43;
    border-color: #ff9f43;
  }
/* 
  .edit-button.editing:hover {
    background: #e67e22;
    border-color: #e67e22;
  } */

  /* .disabled-container {
    pointer-events: none;
    background: #b9b6b4a1
  } */

  .test-mask {
    position: relative;
  }
</style>