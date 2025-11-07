<template>
  <div class="milestone-card" @click="() => navigateToRounds(milestoneCard.id)">
    <div class="card-header">
      <h4>{{ store.getCard(milestoneCard.id).name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Описание" :value= "store.getCard(milestoneCard.id).description"/>
        <Field label="Состояние" :value= "store.getCard(milestoneCard.id).stateDisplayValue"/>
        <Field label="Прогресс" :value="store.getCard(milestoneCard.id).completedRoundsCount + '/' + store.getCard(milestoneCard.id).totalRoundsCount"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { useMilestoneCardStore } from './MilestoneCardStore.js'
import { useRouter } from 'vue-router'
import { milestoneStateEnum } from '../../utils/EnumLocalizator.js'
import { criterionApi } from '@/services/criterionApi.js';

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
    const store = useMilestoneCardStore();

    const card = props.milestoneCard;
    store.setCard(card.id, Object.assign({
      stateDisplayValue: milestoneStateEnum[card.state]
    }, card));

    const router = useRouter();

    const navigateToRounds = (milestoneId) => {
        router.push({
          name: 'Rounds',
          params: { 
            milestoneId: milestoneId 
          }
        })
    }

    return {
        store,
        card,
        navigateToRounds
    }
  },

  async mounted() {
    // const criterion = await criterionApi.getCriterionByMilestoneId(this.milestoneCard.id);
    // this.store.getCard(this.milestoneCard.id).criterion = criterion;
  }
}
</script>

<style scoped>
.milestone-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
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