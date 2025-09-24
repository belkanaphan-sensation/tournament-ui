<template>
  <div class="card" @click="navigateToRounds">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
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
import { createMilestoneCardStore } from './MilestoneCardStore.js'
import { useRouter } from 'vue-router'
import { activityStateEnum } from '../../utils/EnumLocalizator.js'

let counter = 0

export default {
  name: 'MilestoneCardComponent',
  components: {
    Field
  },
  props: {
    milestoneCard: {
      type: Object,
      default: () => ({})
    },
  },

  setup(props) {
    const componentId = `milestoneCard-${counter++}`
    const store = createMilestoneCardStore(componentId)
    
    let card = props.milestoneCard;
    store.setId(card.id);
    store.setName(card.name);
    store.setDescription(card.description);
    store.setState(card.state);
    store.setStateDisplayValue(activityStateEnum[card.state]);
    store.setAllCount(card.totalRoundsCount);
    store.setCompletedCount(card.completedRoundsCount)

    const router = useRouter();

    const createNavigationHandler = (customStore = store) => {
      return () => {
        router.push({
          name: 'Rounds',
          params: { 
            milestoneId: store.id 
          }
        })
      }
    }

    const navigateToRounds = createNavigationHandler();

    return {
        store,
        navigateToRounds
    }
  }
}
</script>