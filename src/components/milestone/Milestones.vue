<template>
    <div class="header-container control-panel-background-container">
        <ControlPanel @back="handleBack"/>
        <UserIcon/>
    </div>

    <div class="title-container">
      <span> Этапы </span>
    </div>

    <div class="content-container">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка активностей...</p>
        </div>

        <div v-if="milestones.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Нет данных для отображения</h3>
            <p>Здесь появятся карточки этапов, когда они будут добавлены</p>
        </div>

        <div v-for="(milestoneCard, index) in milestones" :key="index" class="card-item">
          <MilestoneCard :milestoneCard="milestoneCard"/>
        </div>
    </div>
</template>

<script>
import MilestoneCard from './MilestoneCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Milestones',
  components: {
    MilestoneCard,
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

    this.isLoading = true;
    try {
      this.milestones = await this.fetchMilestones(parseInt(params.activityId)) || [];
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
      async fetchMilestones(activityId) {
          return milestoneApi.getByActivityIdInLifeStates(activityId);
      },
  },

  data() {
      return {
          milestones: [],
          isLoading: true
      }
  },
}
</script>