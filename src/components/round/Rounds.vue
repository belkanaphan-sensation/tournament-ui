<template>
    <div class="header-container control-panel-background-container">
        <ControlPanel @back="handleBack"/>
        <UserIcon/>
    </div>

    <div class="title-container">
      <span> Раунды </span>
    </div>

    <div class="content-container">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка активностей...</p>
        </div>

        <div v-if="rounds.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Нет данных для отображения</h3>
            <p>Здесь появятся карточки раундов, когда они будут добавлены</p>
        </div>

        <div v-for="(roundCard, index) in rounds" :key="index" class="card-item">
          <RoundCard :roundCard="roundCard"/>
        </div>
    </div>
</template>

<script>
import RoundCard from './RoundCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { roundApi } from '@/services/roundApi.js';
import { roundResultStatusApi } from '@/services/roundResultStatusApi.js';
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Rounds',
  components: {
    RoundCard,
    ControlPanel,
    UserIcon
  },
  props: {
    
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

  async mounted() {
    const route = useRoute();
    const params = route.params;
    this.milestoneId = parseInt(params.milestoneId);
    
    this.isLoading = true;
    try {
      // this.roundResultStatusMap = await this.fetchRoundResultStatusByMilestoneId();
      this.rounds = await this.fetchRounds();
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
    async fetchRounds() {
      return roundApi.getByMilestoneIdInLifeStates(this.milestoneId) || [];
    },

    // async fetchRoundResultStatusByMilestoneId() {
    //   return roundResultStatusApi.getRoundResultStatusByMilestoneId(this.milestoneId);
    // },
  },

  data() {
      return {
          rounds: [],
          isLoading: true,
          // roundResultStatusMap: {}
      }
  },
}
</script>