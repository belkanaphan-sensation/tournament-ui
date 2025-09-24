<template>
    <div class="header-container container-background">
        <ControlPanel @back="handleBack"/>
        <UserIcon/>
    </div>
    <div class="content-container container-background">
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
    milestones: {
      type: Array,
      default: () => []
    },
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
      await this.fetchMilestones(parseInt(params.activityId))
    } finally {
        this.isLoading = false;
    }
  },

    methods: {
        async fetchMilestones(activityId) {
            const response = await milestoneApi.getByActivityIdInLifeStates(activityId);
            this.milestones = response && response?.content || [];
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