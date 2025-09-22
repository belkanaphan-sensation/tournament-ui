<template>
    <ControlPanel @back="handleBack"/>
    <div class="card-list">
        <div v-for="(roundCard, index) in rounds" :key="index" class="card-item">
        <RoundCard :roundCard="roundCard"/>
        </div>
    </div>
</template>

<script>
import RoundCard from './RoundCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import { roundApi } from '@/services/roundApi.js';
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Rounds',
  components: {
    RoundCard,
    ControlPanel
  },
  props: {
    rounds: {
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

    await this.fetchRounds(parseInt(params.milestoneId))
  },

    methods: {
        async fetchRounds(roundId) {
            this.loading = true
            this.error = null
            try {
                const response = await roundApi.getRounds(roundId);
                this.rounds = response.content;
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
            rounds: []
        }
    },
}
</script>