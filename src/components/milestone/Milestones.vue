<template>
    <div class="milestones-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="title-container">
            <span>Этапы</span>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />

            <div v-if="milestones.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Нет данных для отображения</h3>
                <p>Здесь появятся карточки этапов, когда они будут добавлены</p>
            </div>

            <div class="cards-grid">
                <div v-for="(milestoneCard, index) in milestones" :key="index" class="card-item">
                    <MilestoneCard :milestoneCard="milestoneCard"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MilestoneCard from './MilestoneCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { useRoute, useRouter } from 'vue-router';
import LoadingOverlay from '../common/LoadingOverlay.vue';

export default {
  name: 'Milestones',
  components: {
    MilestoneCard,
    ControlPanel,
    UserIcon,
    LoadingOverlay
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
          return milestoneApi.getMilestones(activityId);
      },

      handleRefresh() {
        window.location.reload();
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

<style scoped>
.milestones-page {
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

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.card-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-item:hover {
    transform: translateY(-5px);
}

.empty-state {
    text-align: center;
    /* padding: 60px 20px; */
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-top: 40px;
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
}
</style>