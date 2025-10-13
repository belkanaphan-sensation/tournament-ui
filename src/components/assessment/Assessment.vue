<template>

    <!-- Control panel -->
    <div class="header-container control-panel-background-container">
        <ControlPanel @back="handleBack"/>
        <UserIcon/>
    </div>

    <div class="title-container">
      <span> Участники на оценку </span>
    </div>

    <div class="content-container container-background">
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка активностей...</p>
        </div>

      <div v-for="(participant, index) in store.participants" :key="index">
         <div class="card" @click="toggleParticipant(participant)">


          <div class="card-header collaps-card-header">
            <h3> № {{ participant.number }} </h3>
             <span class="collapse-icon"> {{ participant?.isCollapsed ? '▶' : '▼' }} </span>
          </div>

          <div v-if="!participant.isCollapsed" class="performance-content">
            <div class="category-label"> "Музыкальность" </div>

             <!-- <div 
              v-for="(category, catIndex) in performance.categories" 
              :key="category.id" 
              class="category-group"
            >
              
              <div class="category-label"> {{ category.label }} </div>

            </div>  -->
          </div> 
        </div> 
      </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import Field from '../common/Field.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { useRouter, useRoute } from 'vue-router'
import { createAssessmentStore } from './AssessmentStore.js'
import { participantApi } from '@/services/participantApi.js';

let counter = 0

export default {
  name: 'Milestones',

  components: {
    ControlPanel,
    UserIcon,
    Field
  },

  props: {
    roundId: {
      type: Number,
      default: undefined
    },
    milestoneId: {
      type: Number,
      default: undefined
    },
  },

  setup(props) {
    const componentId = `assessment-${counter++}`
    const store = createAssessmentStore(componentId)

    // const participant = {
    //   number: '74'
    // }

    // const participants = [participant, {number: '65'}];
    // store.setParticipants(participants);

    const router = useRouter();
    const route = useRoute();

    const handleBack = () => {
      router.go(-1);
    }

    return {
      handleBack,
      store
    }
  },

  async mounted() {
    this.isLoading = true;
    try {
        const participantResponse = await participantApi.getParticipantsByRoundId(this.roundId);
        let participantResponseContent = [];
        if (participantResponse && participantResponse?.content) {
          participantResponseContent = participantResponse.content;
          for (let i = 0; i < participantResponseContent.length; i++) {
            participantResponseContent[i].isCollapsed = true;
          }
        }

        this.store.setParticipants(participantResponseContent);
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
    toggleParticipant(participant) {
      if (participant) {
        participant.isCollapsed = !participant.isCollapsed;
      }
    },
  },

  data() {
    return {
        isLoading: true
    }
},
}
</script>





<style scoped>
.performance-rating-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.performance-group {
  border: 2px solid #e3f2fd;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  overflow: hidden;
  transition: all 0.3s ease;
}

.performance-group:hover {
  border-color: #bbdefb;
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
}

.performance-header {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  padding: 20px;
  cursor: pointer;
  user-select: none;
}

.performance-title {
  font-weight: 700;
  font-size: 18px;
}

.collapse-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.performance-info {
  opacity: 0.9;
  font-size: 13px;
}

.performance-content {
  padding: 24px;
}

.category-group {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: white;
}

.category-group:last-child {
  margin-bottom: 0;
}

.category-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.buttons-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.rating-button {
  width: 36px;
  height: 36px;
  border: 2px solid #2196f3;
  border-radius: 8px;
  background-color: white;
  color: #2196f3;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-button:hover {
  background-color: #e3f2fd;
  transform: translateY(-1px);
}

.rating-button.active {
  background-color: #2196f3;
  color: white;
  border-color: #1976d2;
}

.rating-button.selected {
  background-color: #1976d2;
  border-color: #0d47a1;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
}

.selected-info {
  text-align: center;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.performance-summary {
  margin-top: 24px;
  padding: 16px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 12px;
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.summary-item {
  text-align: center;
  font-size: 14px;
}

.summary-item strong {
  color: #1976d2;
}

.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.controls button {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.controls button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

/* Адаптивность */
@media (max-width: 768px) {
  .performance-rating-container {
    padding: 12px;
  }
  
  .performance-header {
    padding: 16px;
  }
  
  .performance-content {
    padding: 16px;
  }
  
  .performance-summary {
    flex-direction: column;
    gap: 12px;
  }
  
  .rating-button {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .performance-title {
    font-size: 16px;
  }

  .collaps-card-header {
    display: flex;
    justify-content: space-between; /* h3 слева, span справа */
    align-items: center;
  }
}
</style>