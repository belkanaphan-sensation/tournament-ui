<template>
    <div class="milestones-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="title-container">
            <span>Этапы</span>
        </div>

        <!-- Блок со списком судей -->
        <div class="collapsible-sections judges-section" v-if="showJudgePanel">
            <div class="collapsible-section">
                <div class="section-header" @click="toggleSection('judges')">
                    <span class="section-title">Судьи: {{judges.length}}</span>
                    <span class="section-arrow">{{ isJudgesOpen ? '▼' : '▶' }}</span>
                </div>
                <div v-if="isJudgesOpen" class="section-content">
                    <div class="judges-list">
                        <div v-for="activityUser in judges" 
                            :key="activityUser.id">
                            <div class="judge-card">
                                <div class="judge-info">
                                    <span class="judge-name">{{ activityUser.user?.person?.name }} {{ activityUser.user?.person?.surname }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="judges.length === 0" class="empty-section">
                            Нет судей
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />

            <div v-if="milestones.length === 0 && !isLoading" class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Нет данных для отображения</h3>
                <p>Здесь появятся карточки этапов, когда они будут добавлены</p>
            </div>

            <div class="cards-grid">
                <div v-for="(milestoneCard, index) in milestones" :key="index" class="card-item">
                    <MilestoneCard :milestoneCard="milestoneCard"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import MilestoneCard from './MilestoneCard.vue';
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { useRoute, useRouter } from 'vue-router';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import { activityUserApi } from '@/services/activityUserApi.js';

export default {
  name: 'Milestones',
  components: {
    MilestoneCard,
    ControlPanel,
    UserIcon,
    LoadingOverlay
  },
  props: {
  },

  setup(props) {
    const router = useRouter()
    const handleBack = () => {
      router.go(-1);
    }

    return {
      handleBack
    }
  },

  async mounted() {
    const route = useRoute();
    const params = route.params;

    this.isLoading = true;
    try {
        this.milestones = await this.fetchMilestones(parseInt(params.activityId)) || [];
        this.activityUsers = await this.fetchActivityUsers(parseInt(params.activityId)) || [];

        this.activityUsers = this.activityUsers.filter(user =>
            user.position === 'JUDGE_CHIEF' || user.position === 'JUDGE'
        );
        
        this.activityUsers.sort((a, b) => {
            if (a.partnerSide === 'LEADER' && b.partnerSide !== 'LEADER') {
                return -1;
            }
            if (b.partnerSide === 'LEADER' && a.partnerSide !== 'LEADER') {
                return 1;
            }
            return 0;
        });
    } finally {
        this.isLoading = false;
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const role = userInfo?.roles?.[0];
    this.showJudgePanel = role === 'ANNOUNCER';
  },

  methods: {
        async fetchMilestones(activityId) {
            return milestoneApi.getByActivityIdInInProgressState(activityId);
        },
      
        async fetchActivityUsers(activityId) {
            return activityUserApi.getActivityUserByActivityId(activityId);
        },

      handleRefresh() {
        window.location.reload();
      },

      toggleSection(section) {
          if (section === 'judges') {
              this.isJudgesOpen = !this.isJudgesOpen;
          }
      },
  },

  computed: {
      judges() {
          // Фильтруем только судей (JUDGE и JUDGE_CHIEF) из activityUsers
          return this.activityUsers.filter(user =>
              user.position === 'JUDGE' || user.position === 'JUDGE_CHIEF'
          );
      }
  },

  data() {
      return {
          milestones: [],
          isLoading: true,
          activityUsers: [],
          isJudgesOpen: false,
          showJudgePanel: false,
      }
  },
}
</script>

<style scoped>
.milestones-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
    padding-bottom: 40px;
}

.header-container {
    background: white;
    padding: 15px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title-container {
    padding: 30px 20px 20px;
    text-align: center;
}

.title-container span {
    font-size: 2.5rem;
    font-weight: bold;
    color: #333;
}

/* Стили для секции судей */
.judges-section {
    max-width: 1200px;
    margin: 0 auto 20px;
    padding: 0 20px;
}

.collapsible-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.collapsible-section:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.section-header {
    padding: 20px 25px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    border-bottom: 1px solid #dee2e6;
}

.section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #495057;
}

.section-arrow {
    font-size: 1.1rem;
    color: #6c757d;
    transition: transform 0.3s ease;
}

.section-content {
    padding: 25px;
    background: #fff;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Стили для списка судей */
.judges-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.judge-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.judge-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.judge-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.empty-section {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
    font-style: italic;
    background: #f8f9fa;
    border-radius: 8px;
    grid-column: 1 / -1;
}

.content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    position: relative;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.card-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-item:hover {
    transform: translateY(-5px);
}

.empty-state {
    text-align: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    margin-top: 40px;
    padding: 60px 20px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.empty-state h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.empty-state p {
    color: #666;
    font-size: 1rem;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .title-container span {
        font-size: 2rem;
    }
    
    .judges-section {
        padding: 0 15px;
    }
    
    .section-header {
        padding: 15px 20px;
    }
    
    .section-title {
        font-size: 1.1rem;
    }
    
    .section-content {
        padding: 20px 15px;
    }
    
    .judges-list {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .judge-card {
        padding: 12px;
    }
    
    .judge-details {
        flex-direction: column;
        gap: 5px;
    }
    
    .cards-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .content-container {
        padding: 0 15px 30px;
    }
}

@media (max-width: 480px) {
    .judges-section {
        padding: 0 10px;
    }
    
    .section-header {
        padding: 12px 15px;
    }
    
    .section-content {
        padding: 15px 10px;
    }
    
    .judge-name {
        font-size: 0.9rem;
    }
}
</style>