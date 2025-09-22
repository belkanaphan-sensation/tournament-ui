<template>
  <div class="card" @click="navigateToRounds">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
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
import { createMilestoneCardStore } from './MilestoneCardStore.js'
import { useRouter } from 'vue-router'

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
      store.setStatus(card.status);
      store.setAllCount(card.allCount);
      store.setCompletedCount(card.completedCount)

      const router = useRouter();

      const createNavigationHandler = (customStore = store) => {
        return () => {
          // const id = props.storeId || props.store.id
          
          // Переход на страницу Activities с параметром ID

          setTimeout(() => {
            router.push({
              name: 'Rounds',
              params: { 
                milestoneId: store.id 
              }
          })}, 100);
          
          
          // Альтернативные варианты:
          // router.push(`/activities/${id}`)
          // router.push({ path: `/activities/${id}` })
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