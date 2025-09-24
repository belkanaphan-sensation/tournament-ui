<template>
    <div class="header-container container-background">
        <ControlPanel/>
        <UserIcon/>
    </div>
    <div class="content-container container-background">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка активностей...</p>
        </div>

        <div v-for="(occasionCard, index) in occasions" :key="index" class="card-item">
          <OccasionCard :occasionCard="occasionCard"/>
        </div>

        <div v-if="occasions.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Нет данных для отображения</h3>
            <p>Здесь появятся карточки мероприятий, когда они будут добавлены</p>
        </div>
    </div>
</template>

<script>
import OccasionCard from './OccasionCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { occasionApi } from '@/services/occasionApi.js';

export default {
  name: 'Occasions',
  components: {
    OccasionCard,
    ControlPanel,
    UserIcon
  },
  props: {
    occasions: {
      type: Array,
      default: () => []
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



</style>