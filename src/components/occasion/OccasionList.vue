<template>
    <div class="occasions-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel/>
            <UserIcon/>
        </div>

        <div class="title-container">
            <span>Мероприятия</span>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            <div class="cards-list">
                <div v-for="(occasionCard, index) in occasions" :key="index" class="card-item">
                    <OccasionCard :occasionCard="occasionCard" @click="() => navigateToOccasionDetail(occasionCard.id)"/>
                </div>
            </div>

            <div v-if="occasions.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Нет данных для отображения</h3>
                <p>Здесь появятся карточки мероприятий, когда они будут добавлены</p>
            </div>
        </div>
    </div>
</template>

<script>
import OccasionCard from './OccasionCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { occasionApi } from '@/services/occasionApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { useRouter } from 'vue-router'

export default {
  name: 'OccasionList',
  components: {
    OccasionCard,
    ControlPanel,
    UserIcon,
    LoadingOverlay
  },
  props: {
    occasions: {
      type: Array,
      default: () => []
    }
  },

  setup(props) {
    const router = useRouter();

    const navigateToOccasionDetail = (occasionId) => {
      router.push({
          name: 'OccasionDetail',
          params: { 
            occasionId: occasionId
          }
        })
    }

    return {
        navigateToOccasionDetail
    }
  },

  async mounted() {
    this.isLoading = true;
    try {
      await this.fetchOccasions()
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
      async fetchOccasions() {
          const response = await occasionApi.getOccasions();
          this.occasions = response && response?.content || [];
      },
  },

  data() {
      return {
          occasions: [],
          isLoading: true
      }
  },
}
</script>

<style scoped>
.occasions-page {
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

.cards-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
}

.card-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 100%;
}

.card-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
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

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    .title-container span {
        font-size: 2rem;
    }
    
    .cards-list {
        gap: 15px;
    }
    
    .content-container {
        padding: 0 15px 30px;
    }
    
    .card-item:hover {
        transform: none;
    }
}

/* Дополнительные стили для лучшего отображения на десктопе */
@media (min-width: 1024px) {
    .cards-list {
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>