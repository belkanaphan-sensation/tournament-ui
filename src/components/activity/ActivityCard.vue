<template>
  <div class="card" @click="navigateToMilestones">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
        <Field label="Дата начала" :value="store.startDateTime"/>
        <Field label="Дата окончания" :value="store.endDateTime"/>
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
import { createActivityCardStore } from './ActivityCardStore.js'
import { useRouter } from 'vue-router'
import { occasionStateEnum } from '../../utils/EnumLocalizator.js'

let counter = 0

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
    const componentId = `activityCard-${counter++}`
    const store = createActivityCardStore(componentId)
    
    let card = props.activityCard;
    store.setId(card.id);
    store.setName(card.name);
    store.setDescription(card.description);
    store.setState(card.state);
    store.setStateDisplayValue(occasionStateEnum[card.state]);
    store.setStartDateTime(card.startDateTime);
    store.setEndDateTime(card.startDateTime);
    store.setAllCount(card.totalMilestonesCount);
    store.setCompletedCount(card.completedMilestonesCount)

    const router = useRouter();

    const createNavigationHandler = (customStore = store) => {
      return () => {
        router.push({
          name: 'Milestones',
          params: { 
            activityId: store.id 
          }
        })
      }
    }

    const navigateToMilestones = createNavigationHandler();

    return {
        store,
        navigateToMilestones
    }
  }
}
</script>