<template>
    <ControlPanel/>
    <div class="card-list">
        <div v-for="(occasionCard, index) in occasions" :key="index" class="card-item">
        <OccasionCard :occasionCard="occasionCard"/>
        </div>
    </div>
</template>

<script>
import OccasionCard from './OccasionCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import { occasionApi } from '@/services/occasionApi.js';

export default {
  name: 'Occasions',
  components: {
    OccasionCard,
    ControlPanel
  },
  props: {
    occasions: {
      type: Array,
      default: () => []
    }
  },

  async mounted() {
    await this.fetchOccasions()
  },

    methods: {
        async fetchOccasions() {
            this.loading = true
            this.error = null
            try {
                const response = await occasionApi.getOccasions();
                this.occasions = response.content;
                // this.users = response.data
            } catch (err) {
                // this.error = 'Failed to fetch users: ' + err.message
                // console.error('Error:', err)
            } finally {
                // this.loading = false
            }
        },
    },

    data() {
        return {
            occasions: []
        }
    },
}
</script>