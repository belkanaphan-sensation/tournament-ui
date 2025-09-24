<template>
  <div class="card" @click="navigateToActivities">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
        <Field label="Дата начала" :value="store.startDate"/>
        <Field label="Описание" :value= "store.description"/>
        <Field label="Состояние" :value= "store.stateDisplayValue"/>
        <Field label="Прогресс" :value="store.completedCount + '/' + store.allCount"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { createOccasionCardStore } from './OccasionCardStore.js'
import { useRouter } from 'vue-router'
import { occasionStateEnum } from '../../utils/EnumLocalizator.js'

let counter = 0

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
    const componentId = `occasionCard-${counter++}`
    const store = createOccasionCardStore(componentId)
    
    let card = props.occasionCard;
    store.setId(card.id);
    store.setName(card.name);
    store.setDescription(card.description);
    store.setState(card.state);
    store.setStateDisplayValue(occasionStateEnum[card.state]);
    store.setStartDate(card.startDate);
    store.setAllCount(card.totalActivitiesCount);
    store.setCompletedCount(card.completedActivitiesCount)

    const router = useRouter();

    const createNavigationHandler = (customStore = store) => {
      return () => {
        router.push({
          name: 'Activities',
          params: { 
            occasionId: store.id 
          }
        })
      }
    }

    const navigateToActivities = createNavigationHandler();

    return {
        store,
        navigateToActivities
    }
  }
}
</script>