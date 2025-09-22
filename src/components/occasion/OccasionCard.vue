<template>
  <div class="card" @click="navigateToActivities">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
        <Field label="Дата начала" :value="store.startDate"/>
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
import { createOccasionCardStore } from './OccasionCardStore.js'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

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
      store.setStatus(card.status);
      store.setStartDate(card.startDate);
      store.setAllCount(card.allCount);
      store.setCompletedCount(card.completedCount)

      const router = useRouter();

      const createNavigationHandler = (customStore = store) => {
        return () => {
          // const id = props.storeId || props.store.id
          
          // Переход на страницу Activities с параметром ID

          setTimeout(() => {
            router.push({
              name: 'Activities',
              params: { 
                occasionId: store.id 
              }
          })}, 100);
          
          
          // Альтернативные варианты:
          // router.push(`/activities/${id}`)
          // router.push({ path: `/activities/${id}` })
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