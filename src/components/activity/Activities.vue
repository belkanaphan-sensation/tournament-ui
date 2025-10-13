<template>
    <div class="header-container control-panel-background-container">
        <ControlPanel @back="handleBack"/>
        <UserIcon/>
    </div>

    <div class="title-container">
      <span> Активности </span>
    </div>

    <div class="content-container">
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
import { assignmentApi } from '@/services/assignmentApi.js';
import { useRoute, useRouter } from 'vue-router'
import { positionEnum } from '../../utils/EnumLocalizator.js'

export default {
  name: 'Activities',
  components: {
    ActivityCard,
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
      await this.fetchActivities(parseInt(params.occasionId))
    } finally {
        this.isLoading = false;
    }
  },

    methods: {
        async fetchActivities(occasionId) {
            const activityResponse = await activityApi.getByOccasionIdInLifeStates(occasionId);

            let activities = [];
            if (activityResponse) {
              activities = activityResponse;
              const assignmentResponse = await assignmentApi.getAssignmentByOccasionIdForCurrentUser(occasionId);
              
              if (assignmentResponse && assignmentResponse.length > 0) {
                const activityMap = new Map(activities.map(item => [item.id, item]));

                for (let i = 0; i < assignmentResponse.length; i++) {
                  const assignment = assignmentResponse[i];
                  assignment.positionDisplayValue = positionEnum[assignment.position];
                  
                  const activity = activityMap.get(assignment.activity?.id);
                  if (activity) {
                    activity.assignment = assignment;
                  }
                }
              }
            }

            this.activities = activities;
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