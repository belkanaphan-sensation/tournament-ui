<template>
  <div class="activity-card" @click="() => navigateToMilestones(activityCard.id)">
    <div class="card-header">
      <h4>{{ store.getCard(activityCard.id).name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Дата начала" :value="store.getCard(activityCard.id).startDateTime"/>
        <Field label="Дата окончания" :value="store.getCard(activityCard.id).endDateTime"/>
        <Field label="Описание" :value= "store.getCard(activityCard.id).description"/>
        <Field label="Состояние" :value= "store.getCard(activityCard.id).stateDisplayValue"/>
        <Field label="Прогресс" :value="store.getCard(activityCard.id).completedMilestonesCount + '/' + store.getCard(activityCard.id).totalMilestonesCount"/>
        <Field label="Позиция" :value="store.getCard(activityCard.id)?.assignment?.positionDisplayValue"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { useActivityCardStore } from './ActivityCardStore.js'
import { useRouter } from 'vue-router'
import { activityStateEnum } from '../../utils/EnumLocalizator.js'

export default {
  name: 'ActivityCardComponent',
  components: {
    Field
  },
  props: {
    activityCard: {
      type: Object,
      default: () => ({})
    },
  },

  setup(props) {
    const store = useActivityCardStore();

    const card = props.activityCard;
    store.setCard(card.id, Object.assign({
      stateDisplayValue: activityStateEnum[card.state]
    }, card));

    const router = useRouter();

    const navigateToMilestones = (activityId) => {
      router.push({
          name: 'Milestones',
          params: { 
            activityId: activityId
          }
        })
    }

    return {
        store,
        card,
        navigateToMilestones
    }
  }
}
</script>

<style scoped>
.activity-card {
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

.activity-card:hover {
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

.activity-card {
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
  .activity-card {
    padding: 15px;
  }
  
  .card-header h4 {
    font-size: 1.1rem;
  }
}
</style>