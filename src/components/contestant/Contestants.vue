<template>
    <div class="contestants-page">
        <!-- Control panel -->
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="title-container">
            <span>Участники на оценку</span>
        </div>

        <div class="content-container" :class="{'disabled-container': roundResultStatus === 'READY'}">
            <LoadingOverlay :isLoading="isLoading" />
            <div v-if="contestants.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Нет данных для отображения</h3>
                <p>Здесь появятся участники на оценку, когда они будут добавлены</p>
            </div>

            <div class="cards-grid">
                <div v-for="(contestant, index) in contestants" :key="index" class="contestant-item">
                    <div class="test-mask">
                        <ContestantCard 
                            :contestantId="contestant.id"
                            :contestantNumber="contestant.number"
                            :criterion="criterion" 
                            :roundId="Number(this.roundId)"/>
                        <Mask v-if="roundResultStatus === 'READY'" />
                    </div> 
                </div>
            </div>
        </div>

        <div class="action-container-wrapper">
          <div class="action-container">
            <button v-if="(!roundResultStatus || roundResultStatus == '' || roundResultStatus === 'NOT_READY') && isActiveRoundState()"
                class="button"
                @click="toReadyRoundResultStatus"
            >Готово</button>

            <button v-if="roundResultStatus === 'READY' && isActiveRoundState()"
                class="button edit-button"
                @click="backToNotReadyRoundResultStatus"
            >Редактировать</button>
          </div>
        </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import Mask from '../common/Mask.vue';
import Field from '../common/Field.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import ContestantCard from './ContestantCard.vue';
import { useRouter } from 'vue-router'
import { contestantApi } from '@/services/contestantApi.js';
import { criterionApi } from '@/services/criterionApi.js';
import { judgeResultApi } from '@/services/judgeResultApi.js';
import { milestoneRuleApi } from '@/services/milestoneRuleApi.js';
import { roundResultStatusApi } from '@/services/roundResultStatusApi.js';
import { judgeRoundStatusApi } from '@/services/judgeRoundStatusApi.js';
import { useJudgeResultStore } from '../../store/JudgeResultStore.js';
import { roundApi } from '@/services/roundApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue'

export default {
  name: 'Milestones',

  components: {
    ControlPanel,
    UserIcon,
    Field,
    ContestantCard,
    Mask,
    LoadingOverlay
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
      this.contestants = await this.fetchContestants(this.roundId) || [];
      this.milestoneRule = await this.fetchMilesoneRule() || {};
      this.criterion = await this.fetchCriterion() || [];
      this.roundResults = await this.fetchJudgeRoundResults() || [];
      this.roundResultStatus = await this.fetchRoundResultStatus();
      this.round = await this.fetchRound();
      this.updateLocalStorageRoundResults();
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
    async backToNotReadyRoundResultStatus() {
      this.isLoading = true;
      try {
        this.roundResultStatus = await judgeRoundStatusApi.getJudgeRoundResult(this.roundId).status;
      } finally {
        this.isLoading = false;
      }
    },

    async toReadyRoundResultStatus() {
      this.isLoading = true;
      try {
        const resultStore = useJudgeResultStore();
        this.roundResults = await this.pushRawResult(resultStore.getRoundResultFlat(this.roundId));
        if (this.roundResults) {
          resultStore.clearByRoundId(this.roundId);
          this.updateLocalStorageRoundResults();
        }
        
        this.roundResultStatus = await this.fetchRoundResultStatus();
      } finally {
        this.isLoading = false;
      }
    },

    isActiveRoundState() {
      return this.round && (this.round.state == 'OPENED');
    },

    async pushRawResult(judgeMilestoneResultRoundRequests) {
      return judgeResultApi.pushRawResult(this.roundId, judgeMilestoneResultRoundRequests);
    },

    async fetchRoundResultStatus() {
      return roundResultStatusApi.getRoundResultStatus(this.roundId);
    },

    async fetchContestants() {
        return contestantApi.getContestantsByRoundId(this.roundId);
    },

    async fetchMilesoneRule() {
      return milestoneRuleApi.getMilestoneRuleByMilestoneId(this.milestoneId);
    },

    async fetchCriterion() {
        return criterionApi.getCriterionByMilestoneId(this.milestoneId);
    },

    async fetchJudgeRoundResults() {
        return judgeResultApi.getJudgeRoundResult(this.roundId);
    },

    async fetchRound() {
        return roundApi.getRoundDetail(this.roundId);
    },

    updateLocalStorageRoundResults() {
      if (this.roundResults && this.roundResults.length > 0) {
        const resultStore = useJudgeResultStore();
        const allResults = resultStore.getAll();
        if (allResults) {
          for (let i = 0; i < this.roundResults.length; i++) {
            let r = this.roundResults[i];
            if (!resultStore.hasResult(r.round.id, r.milestoneCriterion.id,r.contestant.id)) {
              resultStore.setResult(r.round.id, r.milestoneCriterion.id,r.contestant.id, r.score, r.id);
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
        contestants: [],
        criterion: [],
        criterionMode: undefined,
        roundResult: [],
        roundResultStatus: undefined,
        round: undefined,
    }
  },
}
</script>

<style scoped>

.contestants-page {
    /* min-height: 200vh; */
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
    padding-bottom: 40px;
}

.action-container-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #f5f5f5;
    /* padding: 15px 20px; */
    padding-bottom: 10px;
    box-shadow: 0 -2px 20px rgba(0,0,0,0.1);
    z-index: 1000;
    display: flex;
    align-items: center; /* Выравнивание по вертикали по центру */
    justify-content: center; /* Выравнивание по горизонтали по центру */
    /* min-height: 80px; Фиксированная высота для центрирования */
}

.action-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    max-width: 1200px;
    margin: 0 auto;
    align-items: center; /* Дополнительное выравнивание по вертикали */
}

.header-container {
    background: white;
    padding: 15px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title-container {
    padding: 30px 20px 20px;
    text-align: center;
}

.title-container span {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
}

.content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    position: relative;
}

.content-container.disabled-container {
    opacity: 0.7;
    pointer-events: none;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 30px;
}

.contestant-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.test-mask {
    position: relative;
}

.empty-state {
    text-align: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-top: 40px;
    margin-bottom: 30px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.empty-state h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.empty-state p {
    color: #666;
    font-size: 1rem;
    line-height: 1.5;
}

.action-container {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 30px;
}

.button {
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    box-shadow: 0 4px 15px rgba(0,123,255,0.3);
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,123,255,0.4);
}

.edit-button {
    background: linear-gradient(135deg, #6c757d, #545b62);
    box-shadow: 0 4px 15px rgba(108,117,125,0.3);
}

.edit-button:hover {
    box-shadow: 0 6px 20px rgba(108,117,125,0.4);
}

@media (max-width: 768px) {
    .title-container span {
        font-size: 2rem;
    }
    
    .cards-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .content-container {
        padding: 0 15px 30px;
    }
    
    .action-container {
        flex-direction: column;
        align-items: center;
    }
    
    .button {
        width: 100%;
        max-width: 300px;
    }
}
</style>