<template>
  <div class="card" @click="() => navigateToMilestones(activityCard.id)">
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