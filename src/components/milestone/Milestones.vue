<template>
    <ControlPanel @back="handleBack"/>
    <div class="card-list">
        <div v-for="(milestoneCard, index) in milestones" :key="index" class="card-item">
        <MilestoneCard :milestoneCard="milestoneCard"/>
        </div>
    </div>
</template>

<script>
import MilestoneCard from './MilestoneCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Milestones',
  components: {
    MilestoneCard,
    ControlPanel
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

    await this.fetchMilestones(parseInt(params.activityId))
  },

    methods: {
        async fetchMilestones(activityId) {
            this.loading = true
            this.error = null
            try {
                const response = await milestoneApi.getMilestones(activityId);
                this.milestones = response.content;
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
            milestones: []
        }
    },
}
</script>