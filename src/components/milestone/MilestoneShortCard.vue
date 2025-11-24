<template>
  <div class="milestone-card">
    <div class="card-header">
      <h4>{{ milestoneCard.name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Описание" :value= "milestoneCard.description"/>
        <Field label="Состояние" :class="getStateClass()" :value= "getLocalizedMilestoneState()"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { milestoneStateEnum } from '../../utils/EnumLocalizator.js'

export default {
  name: 'MilestoneCardComponent',
  components: {
    Field
  },
  props: {
    milestoneCard: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props) {
    // const router = useRouter();

    // const navigateToRounds = (milestoneId) => {
    //     router.push({
    //       name: 'Rounds',
    //       params: { 
    //         milestoneId: milestoneId 
    //       }
    //     })
    // }

    return {
        // navigateToRounds
    }
  },

  methods: {
    getLocalizedMilestoneState() {
        return milestoneStateEnum[this.milestoneCard.state];
    },

        getStateClass() {
      const stateClasses = {
        'DRAFT': 'status-opened',
        'PLANNED': 'status-opened',
        'PENDING': 'status-opened',
        'IN_PROGRESS': 'status-opened',
        'SUMMARIZING': 'status-opened',
        'COMPLETED': 'status-closed',
        'SKIPPED': 'status-closed',
      };
      return stateClasses[this.milestoneCard.state] || 'status-unknown';
    },
  },

  async mounted() {
    // const criterion = await criterionApi.getCriterionByMilestoneId(this.milestoneCard.id);
    // this.store.getCard(this.milestoneCard.id).criterion = criterion;
  }
}
</script>

<style scoped>
.status-opened { background: #e3f2fd; color: #1976d2; }
.status-closed { background: #e8f5e8; color: #2e7d32; }
.status-unknown { background: #f5f5f5; color: #666; }

.milestone-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.milestone-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.milestone-card {
  animation: cardAppear 0.5s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .milestone-card {
    padding: 15px;
  }
  
  .card-header h4 {
    font-size: 1.1rem;
  }
}
</style>