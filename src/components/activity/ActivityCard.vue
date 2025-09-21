<template>
  <div class="card">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
        <Field label="Дата начала" :value="store.startDate"/>
        <Field label="Дата окончания" :value="store.startDate"/>
        <Field label="Описание" :value= "store.description"/>
        <Field label="Статус" :value= "store.status"/>
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
      store.setName(card.name);
      store.setDescription(card.description);
      store.setStatus(card.status);
      store.setStartDate(card.startDate);
      store.setEndDate(card.startDate);
      store.setAllCount(card.allCount);
      store.setCompletedCount(card.completedCount)

      return {
          store
      }
  }
}
</script>