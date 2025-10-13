<template>
  <div class="card" @click="() => navigateToActivities(occasionCard.id)">
    <div class="card-header">
      <h4>{{ store.getCard(occasionCard.id).name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Дата начала" :value="store.getCard(occasionCard.id).startDate"/>
        <Field label="Описание" :value= "store.getCard(occasionCard.id).description"/>
        <Field label="Состояние" :value= "store.getCard(occasionCard.id).stateDisplayValue"/>
        <Field label="Прогресс" :value="store.getCard(occasionCard.id).completedActivitiesCount + '/' + store.getCard(occasionCard.id).totalActivitiesCount"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { useOccasionCardStore } from './OccasionCardStore.js'
import { useRouter } from 'vue-router'
import { occasionStateEnum } from '../../utils/EnumLocalizator.js'

export default {
  name: 'OcassionCardComponent',
  components: {
    Field
  },
  props: {
    occasionCard: {
      type: Object,
      default: () => ({})
    },
  },

  setup(props) {
    const store = useOccasionCardStore();

    const card = props.occasionCard;
    store.setCard(card.id, Object.assign({
      stateDisplayValue: occasionStateEnum[card.state]
    }, card));

    const router = useRouter();

    const navigateToActivities = (occasionId) => {
      router.push({
          name: 'Activities',
          params: { 
            occasionId: occasionId 
          }
        })
    }

    return {
        store,
        card,
        navigateToActivities
    }
  }
}
</script>