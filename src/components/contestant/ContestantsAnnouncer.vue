<template>
    <div class="contestants-page">
        <!-- Control panel -->
        <div class="header-container control-panel-background-container">
            <ControlPanel @back="handleBack" @refresh="handleRefresh"/>
            <UserIcon/>
        </div>

        <div class="title-container">
            <span>Участники на оценку</span>
        </div>

        <div v-if="isSingleMode">
            <!-- Сворачиваемые блоки для участников по сторонам -->
            <div class="collapsible-sections">
                <!-- Блок для LEAD -->
                <div class="collapsible-section">
                    <div class="section-header" @click="toggleSection('leader')">
                        <span class="section-title">Партнеры: {{leaderContestants.length}}</span>
                        <span class="section-arrow">{{ isLeadOpen ? '▼' : '▶' }}</span>
                    </div>
                    <div v-if="isLeadOpen" class="section-content">
                        <div class="contestants-list">
                            <div v-for="contestant in leaderContestants" 
                                :key="contestant.id" 
                                class="contestant-item">
                                <div class="contestant-card">
                                    <div class="contestant-number">{{ contestant.number }}</div>
                                    <div class="contestant-participants">
                                        <!-- Основные участники -->
                                        <div v-for="participant in contestant.participants" 
                                            :key="participant.participantId"
                                            class="participant-info">
                                            <span class="participant-name">{{ participant.name }} {{ participant.surname }}</span>
                                        </div>
                                        
                                        <!-- Ассистенты -->
                                        <div v-for="assistant in getAssistants(contestant)" 
                                            :key="assistant.key"
                                            class="participant-info assistant">
                                            <span class="participant-name">
                                                {{ assistant.person.name }} {{ assistant.person.surname }}
                                                <span class="assistant-label">(ассистент)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="leaderContestants.length === 0" class="empty-section">
                                Нет учавствующих партнеров
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Блок для FOLLOW -->
                <div class="collapsible-section">
                    <div class="section-header" @click="toggleSection('follower')">
                        <span class="section-title">Партнерши: {{followerContestants.length}}</span>
                        <span class="section-arrow">{{ isFollowOpen ? '▼' : '▶' }}</span>
                    </div>
                    <div v-if="isFollowOpen" class="section-content">
                        <div class="contestants-list">
                            <div v-for="contestant in followerContestants" 
                                :key="contestant.id" 
                                class="contestant-item">
                                <div class="contestant-card">
                                    <div class="contestant-number">{{ contestant.number }}</div>
                                    <div class="contestant-participants">
                                        <!-- Основные участники -->
                                        <div v-for="participant in contestant.participants" 
                                            :key="participant.participantId"
                                            class="participant-info">
                                            <span class="participant-name">{{ participant.name }} {{ participant.surname }}</span>
                                        </div>
                                        
                                        <!-- Ассистенты -->
                                        <div v-for="assistant in getAssistants(contestant)" 
                                            :key="assistant.key"
                                            class="participant-info assistant">
                                            <span class="participant-name">
                                                {{ assistant.person.name }} {{ assistant.person.name }}
                                                <span class="assistant-label">(ассистент)</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="followerContestants.length === 0" class="empty-section">
                                Нет учавствующих партнерш
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isCoupleMode">
            <div class="contestants-list">
                <div v-for="contestant in coupleContestants" 
                    :key="contestant.id" 
                    class="contestant-item">
                    <div class="contestant-card">
                        <div class="contestant-number">{{ contestant.number }}</div>
                        <div class="contestant-participants">
                            <!-- Основные участники -->
                            <div v-for="participant in contestant.participants" 
                                :key="participant.participantId"
                                class="participant-info">
                                <span class="participant-name">{{participant.number}} {{ participant.name }} {{ participant.surname }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="coupleContestants.length === 0" class="empty-section">
                    Нет учавствующих пар
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import Mask from '../common/Mask.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { useRouter } from 'vue-router'
import LoadingOverlay from '../common/LoadingOverlay.vue'
import { contestantApi } from '@/services/contestantApi.js';
import { milestoneRuleApi } from '@/services/milestoneRuleApi.js';

export default {
  name: 'ContestantsAnnouncer',

  components: {
    ControlPanel,
    UserIcon,
    Mask,
    LoadingOverlay
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
    const router = useRouter();

    const handleBack = () => {
      router.go(-1);
    }

    return {
      handleBack,
    }
  },

  async mounted() {
    this.isLoading = true;
    try {
        this.contestants = await contestantApi.getByRoundByRoundId(this.roundId);
        this.milestoneRule = await this.fetchMilesoneRule() || {};
    } finally {
        this.isLoading = false;
    }
  },

  methods: {
    handleRefresh() {
          window.location.reload();
    },

    toggleSection(section) {
        if (section === 'leader') {
            this.isLeadOpen = !this.isLeadOpen;
        } else if (section === 'follower') {
            this.isFollowOpen = !this.isFollowOpen;
        }
    },

    async fetchMilesoneRule() {
      return milestoneRuleApi.getMilestoneRuleByMilestoneId(this.milestoneId);
    },

    getAssistants(contestant) {
        if (!contestant || !contestant.participants) return [];
        
        const assistants = [];
        contestant.participants.forEach((participant, index) => {
            if (participant && participant.assistant) {
                assistants.push({
                    ...participant.assistant,
                    key: `assistant_${participant.participantId || index}`
                });
            }
        });
        
        return assistants;
    }
  },

  computed: {
    isSingleMode() {
        return this.milestoneRule && this.milestoneRule.contestantType === 'SINGLE';
    },

    isCoupleMode() {
        return this.milestoneRule && (this.milestoneRule.contestantType === 'COUPLE_TRANSIENT' || this.milestoneRule.contestantType === 'COUPLE_PERSISTENT');
    },

    leaderContestants() {
        return this.contestants.filter(contestant => 
            contestant.contestantType === 'SINGLE' && 
            contestant.participants?.some(p => p.partnerSide === 'LEADER')
        );
    },
    followerContestants() {
        return this.contestants.filter(contestant => 
            contestant.contestantType === 'SINGLE' && 
            contestant.participants?.some(p => p.partnerSide === 'FOLLOWER')
        );
    },
    coupleContestants() {
        return this.contestants.filter(contestant => 
            contestant.contestantType === 'COUPLE_TRANSIENT' || contestant.contestantType === 'COUPLE_PERSISTENT'
        );
    }
  },

    data() {
        return {
            isLoading: true,
            contestants: [],
            criterion: [],
            criterionMode: undefined,
            roundResult: [],
            roundResultStatus: undefined,
            round: undefined,
            isLeadOpen: true,
            isFollowOpen: true,
            milestoneRule: undefined
        }
    },
}
</script>


<style scoped>

.contestants-page {
    /* min-height: 200vh; */
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

.contestant-item {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Стили для сворачиваемых секций */
.collapsible-sections {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
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
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    border-bottom: 1px solid #dee2e6;
}

.section-header:hover {
    background: linear-gradient(135deg, #e9ecef, #dee2e6);
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

.contestants-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 15px;
}

.contestant-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.contestant-card:hover {
    background: #e9ecef;
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.contestant-number {
    font-size: 1.1rem;
    font-weight: 600;
    color: #007bff;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #007bff;
}

.contestant-participants {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.participant-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid #28a745;
}

.participant-info.assistant {
    border-left-color: #ffc107; /* Желтый для ассистентов */
    background: #fff8e1; /* Светло-желтый фон */
}

.participant-name {
    font-weight: 500;
    color: #495057;
    font-size: 0.95rem;
}

.assistant-label {
    font-size: 0.8rem;
    color: #e65100;
    font-style: italic;
    margin-left: 5px;
}

.participant-side {
    font-size: 0.85rem;
    color: #6c757d;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 500;
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

/* Адаптивность */
@media (max-width: 768px) {
    .collapsible-sections {
        padding: 0 15px 30px;
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
    
    .contestants-list {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    
    .contestant-card {
        padding: 12px;
    }
    
    .participant-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .participant-side {
        align-self: flex-end;
    }
}

@media (max-width: 480px) {
    .collapsible-sections {
        padding: 0 10px 20px;
    }
    
    .section-header {
        padding: 12px 15px;
    }
    
    .section-content {
        padding: 15px 10px;
    }
    
    .contestant-number {
        font-size: 1rem;
    }
    
    .participant-name {
        font-size: 0.9rem;
    }
    
    .assistant-label {
        font-size: 0.75rem;
    }
}

/* Специфичные стили для разных сторон */
.collapsible-section:first-child .participant-info:not(.assistant) {
    border-left-color: #dc3545; /* Красный для LEAD */
}

.collapsible-section:last-child .participant-info:not(.assistant) {
    border-left-color: #17a2b8; /* Бирюзовый для FOLLOW */
}

/* Анимация переключения секций */
.collapsible-section {
    transition: all 0.3s ease;
}

.section-content {
    transition: all 0.3s ease;
}

</style>