<template>
    <div class="header-container container-background">
        <ControlPanel @back="handleBack"/>
        <UserIcon/>
    </div>
    <div class="content-container container-background">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p class=" white-font-color">Загрузка активностей...</p>
        </div>

        <div v-if="activities.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Нет данных для отображения</h3>
            <p>Здесь появятся карточки активностей, когда они будут добавлены</p>
        </div>

        <div v-for="(activityCard, index) in activities" :key="index" class="card-item">
          <ActivityCard :activityCard="activityCard"/>
        </div>
    </div>
</template>

<script>
import ActivityCard from './ActivityCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { activityApi } from '@/services/activityApi.js';
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Activities',
  components: {
    ActivityCard,
    ControlPanel,
    UserIcon
  },
  props: {
    activities: {
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
      await this.fetchActivities(parseInt(params.occasionId))
    } finally {
        this.isLoading = false;
    }
  },

    methods: {
        async fetchActivities(occasionId) {
            const response = await activityApi.getByOccasionIdInLifeStates(occasionId);
            this.activities = response && response?.content || [];
        },
    },

    data() {
        return {
            activities: [],
            isLoading: true
        }
    },
}
</script>