<template>
  <div class="activity-card">
    <div class="card-header">
      <h4>{{ activityCard.name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Описание" :value= "activityCard.description"/>
        <Field label="Состояние" :value= "getLocalizedActivityState()"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { activityStateEnum } from '../../utils/EnumLocalizator.js'

export default {
  name: 'ActivityShortCard',
  components: {
    Field
  },
  props: {
    activityCard: {
      type: Object,
      default: () => ({})
    },
  },

  methods: {
    getLocalizedActivityState() {
        return activityStateEnum[this.activityCard.state];
    },
  }
}
</script>

<style scoped>
.activity-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  /* padding-bottom: 20px; */
  padding-left: 20px;
  padding-right: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.activity-card {
  animation: cardAppear 0.5s ease-out;
}
</style>