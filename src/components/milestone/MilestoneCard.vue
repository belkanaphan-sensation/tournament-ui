<template>
  <div class="card" @click="() => navigateToRounds(milestoneCard.id)">
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
import { criteriaApi } from '@/services/criteriaApi.js';

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
    // const criteria = await criteriaApi.getCriteriaByMilestoneId(this.milestoneCard.id);
    // this.store.getCard(this.milestoneCard.id).criteria = criteria;
  }
}
</script>