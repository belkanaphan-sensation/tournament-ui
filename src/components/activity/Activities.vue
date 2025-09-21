<template>
    <ControlPanel/>
    <div class="card-list">
        <div v-for="(activityCard, index) in activities" :key="index" class="card-item">
        <ActivityCard :activityCard="activityCard"/>
        </div>
    </div>
</template>

<script>
import ActivityCard from './ActivityCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import { activityApi } from '@/services/activityApi.js';

export default {
  name: 'Activities',
  components: {
    ActivityCard,
    ControlPanel
  },
  props: {
    activities: {
      type: Array,
      default: () => []
    }
  },

  async mounted() {
    await this.fetchActivities()
  },

    methods: {
        async fetchActivities() {
            this.loading = true
            this.error = null
            try {
                const response = await activityApi.getActivities();
                this.activities = response.content;
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
            activities: []
        }
    },
}
</script>