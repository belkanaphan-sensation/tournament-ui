<template>
  <div class="round-card">
    <div class="card-header">
      <h4>{{ roundCard.name }}</h4>
    </div>
    <div class="card-content">
        <Field label="Состояние" :class="getStateClass()" :value= "getLocalizedMilestoneState()"/>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>

import Field from '../common/Field.vue'
import { roundStateEnum } from '../../utils/EnumLocalizator.js'

export default {
  name: 'RoundShortCard',
  components: {
    Field
  },
  props: {
    roundCard: {
      type: Object,
      default: () => ({})
    },
  },

  methods: {
    getLocalizedMilestoneState() {
        return roundStateEnum[this.roundCard.state];
    },

    getStateClass() {
      const stateClasses = {
        'OPENED': 'status-opened',
        'CLOSED': 'status-closed',
      };
      return stateClasses[this.roundCard.state] || 'status-unknown';
    },
  }
}
</script>

<style scoped>

.status-opened { background: #e3f2fd; color: #1976d2; }
.status-closed { background: #e8f5e8; color: #2e7d32; }
.status-unknown { background: #f5f5f5; color: #666; }

.round-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.round-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.ready-status {
  border-left: 4px solid #28a745;
}

.not-ready-status {
  border-left: 4px solid #dc3545;
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  flex: 1;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: 10px;
  flex-shrink: 0;
  margin-top: 6px;
}

.status-indicator.ready {
  background-color: #28a745;
}

.status-indicator.not_ready {
  background-color: #dc3545;
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

.round-card {
  animation: cardAppear 0.5s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .round-card {
    padding: 15px;
  }
  
  .card-header h4 {
    font-size: 1.1rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-indicator {
    align-self: flex-start;
    margin-left: 0;
  }
}
</style>