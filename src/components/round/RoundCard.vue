<template>
  <div class="card">
    <div class="card-header">
      <h3>{{ store.name }}</h3>
    </div>
    <div class="card-content">
        <Field label="Описание" :value= "store.description"/>
        <Field label="Статус" :value= "store.status"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { createRoundCardStore } from './RoundCardStore.js'

let counter = 0

export default {
  name: 'RoundCardComponent',
  components: {
    Field
  },
  props: {
    roundCard: {
      type: Object,
      default: () => ({})
    },
  },

setup(props) {
      const componentId = `roundCard-${counter++}`
      const store = createRoundCardStore(componentId)
      
      let card = props.roundCard;
      store.setId(card.id);
      store.setName(card.name);
      store.setDescription(card.description);
      store.setStatus(card.status);

      return {
          store
      }
  }
}
</script>