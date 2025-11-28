<template>
    <div class="milestone-detail-page">
        <div class="header-container control-panel-background-container">
            <ControlPanel @refresh="handleRefresh" @back="handleBack"/>
            <UserIcon/>
        </div>

        <div class="content-container">
            <LoadingOverlay :isLoading="isLoading" />
            
            <!-- Детали Milestone -->
            <div class="milestone-result-details" v-if="milestone">
                <div class="milestone-result-header">
                    <div class="header-left">
                        <h1 class="milestone-result-title">Результаты Этапа: {{ milestone.name }} </h1>
                    </div>
                    <div class="header-actions">
                        <button 
                            v-for="(action, index) in getHeaderActions()" 
                            :key="index"
                            :class="['action-btn', action.class]"
                            @click="action.onClick"
                        >
                            {{ action.label }}
                        </button>
                    </div>
                </div>

                <!-- Блок с правилами этапа -->
                <MilestoneRulesCard 
                    :milestoneRule="nextMilestoneRule" 
                    :passedContestantsCounts="passedContestantsCounts"
                    v-if="nextMilestoneRule"
                />

                <!-- Блок с таблицами конкурсантов -->
                <div class="contestant-tables-container" v-if="milestoneRule && milestoneResult.length">
                    <!-- Для COUPLE типов - одна таблица -->
                    <div v-if="isCoupleType" class="single-table-layout">
                        <ContestantTable 
                            :contestants="coupleContestants"
                            :title="'Пары'"
                            :showPartnerSides="true"
                            :selectedResults="selectedResults"
                            :canEdit="canEditResults"
                            @final-decision-changed="handleFinalDecisionChange"
                            @selection-changed="handleResultSelection"
                        />
                    </div>

                    <!-- Для SINGLE типа - две таблицы рядом -->
                    <div v-else class="double-table-layout">
                        <ContestantTable 
                            :contestants="leaderContestants"
                            :title="'Партнеры'"
                            :showPartnerSides="false"
                            :selectedResults="selectedResults"
                            :canEdit="canEditResults"
                            @final-decision-changed="handleFinalDecisionChange"
                            @selection-changed="handleResultSelection"
                        />
                        <ContestantTable 
                            :contestants="followerContestants"
                            :title="'Партнерши'"
                            :showPartnerSides="false"
                            :selectedResults="selectedResults"
                            :canEdit="canEditResults"
                            @final-decision-changed="handleFinalDecisionChange"
                            @selection-changed="handleResultSelection"
                        />
                    </div>
                </div>

                <!-- Сообщение если нет данных -->
                <div v-else-if="milestoneRule && !milestoneResult.length" class="no-data-message">
                    <p>Нет данных о конкурсантах для этого этапа</p>
                </div>
            </div>

            <!-- Состояние загрузки ошибки -->
            <div v-if="error" class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>{{ error }}</p>
                <button class="retry-btn" @click="fetchMilestoneResultDetail">Попробовать снова</button>
            </div>
        </div>
    </div>
</template>

<script>
import ControlPanel from '../common/ControlPanel.vue';
import UserIcon from './../userinfo/UserIcon.vue';
import { milestoneApi } from '@/services/milestoneApi.js';
import { milestoneResultApi } from '@/services/milestoneResultApi.js';
import { milestoneRuleApi } from '@/services/milestoneRuleApi.js';
import { roundApi } from '@/services/roundApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';
import ContestantTable from '../contestant/ContestantTable.vue';
import MilestoneRulesCard from './MilestoneRulesCard.vue';
import { useRouter } from 'vue-router';

export default {
    name: 'MilestoneResultDetail',
    components: {
        ControlPanel,
        UserIcon,
        LoadingOverlay,
        ContestantTable,
        MilestoneRulesCard,
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

    data() {
        return {
            milestone: null,
            milestoneResult: [],
            isLoading: true,
            error: null,
            milestoneRule: null,
            nextMilestoneRule: null,
            modifiedResults: new Set(),
            selectedResults: [],
        }
    },

    async mounted() {
        await this.fetchMilestoneResultDetail();
    },

    computed: {
        // Проверяем, можно ли редактировать результаты
        canEditResults() {
            return this.milestone?.state === 'SUMMARIZING';
        },

        // Проверяем, можно ли создать перетанцовку
        canCreateExtraRound() {
            return this.selectedResults.length > 0;
        },

        // Определяем тип конкурсантов (COUPLE или SINGLE)
        isCoupleType() {
            if (!this.milestoneRule) return false;
            return this.milestoneRule.contestantType === 'COUPLE_TRANSIENT' || 
                   this.milestoneRule.contestantType === 'COUPLE_PERSISTENT';
        },

        // Фильтруем конкурсантов для SINGLE типа
        leaderContestants() {
            return this.milestoneResult.filter(result => 
                result.contestant?.participants?.some(participant => 
                    participant.partnerSide === 'LEADER'
                )
            );
        },

        followerContestants() {
            return this.milestoneResult.filter(result => 
                result.contestant?.participants?.some(participant => 
                    participant.partnerSide === 'FOLLOWER'
                )
            );
        },

        // Все конкурсанты для COUPLE типа
        coupleContestants() {
            return this.milestoneResult;
        },

        // Количество прошедших конкурсантов по таблицам
        passedContestantsCounts() {
            if (this.isCoupleType) {
                // Для пар - одна таблица
                const passedCount = this.coupleContestants.filter(result => result.finallyApproved === true).length;
                return [passedCount];
            } else {
                // Для одиночных - две таблицы
                const passedLeaders = this.leaderContestants.filter(result => result.finallyApproved === true).length;
                const passedFollowers = this.followerContestants.filter(result => result.finallyApproved === true).length;
                return [passedLeaders, passedFollowers];
            }
        }
    },

    methods: {
        handleRefresh() {
            window.location.reload();
        },

        fetchMilestoneResultDetail() {
            this.isLoading = true;
            this.error = null;
            
            try {
                const milestoneId = this.$route.params.milestoneId;
                this.fillDetail(milestoneId);
            } catch (err) {
                this.error = 'Не удалось загрузить данные этапа';
                console.error('Error fetching milestone detail:', err);
            } finally {
                this.isLoading = false;
            }
        },

        async fillDetail(milestoneId) {
            this.milestone = await milestoneApi.getMilestoneDetail(milestoneId);
            this.milestoneRule = await milestoneRuleApi.getMilestoneRuleByMilestoneId(milestoneId);
            this.nextMilestoneRule = await milestoneRuleApi.getNextMilestoneRuleByMilestoneId(milestoneId);
            this.milestoneResult = await milestoneResultApi.getMilestoneResultsByMilestoneId(milestoneId);
        },

        handleFinalDecisionChange(result) {
            this.modifiedResults.add(result.id);
        },

        getHeaderActions() {
            if (!this.milestone) return [];

            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const role = userInfo?.roles?.[0];

            const actions = [{
                    label: this.modifiedResults.size > 0 ? `Сохранить (${this.modifiedResults.size})` : 'Сохранить',
                    class: 'default-action-btn',
                    onClick: () => this.saveResults(),
                    visible: role === 'SUPERADMIN' && this.canEditResults // Добавляем проверку
                },
                {
                    label: `Создать перетанцовку${this.selectedResults.length > 0 ? ` (${this.selectedResults.length})` : ''}`,
                    class: this.selectedResults.length > 0 ? 'default-action-btn' : 'disabled-action-btn',
                    onClick: () => this.handleCreateExtraRound(),
                    visible: role === 'SUPERADMIN' && this.canEditResults // Добавляем проверку
                }
            ];

            return actions.filter(action => action.visible);
        },

        async saveResults() {
            if (this.modifiedResults.size === 0) {
               alert('Нет изменений для сохранения');
               return;
            }

            this.isLoading = true;
            try {
                // Получаем только измененные результаты
                const resultsToUpdate = this.milestoneResult.filter(result => 
                    this.modifiedResults.has(result.id)
                ).map(result => ({
                    id: result.id,
                    finallyApproved: result.finallyApproved
                }));

                await milestoneResultApi.updateMilestoneResult(this.milestone.id, resultsToUpdate);
                this.modifiedResults.clear();
            } catch (error) {
                console.error('Ошибка при сохранении изменений:', error);
                alert('Произошла ошибка при сохранении изменений');
            } finally {
                this.isLoading = false;
            }
        },

        // Обработчик выделения/снятия выделения записи
        handleResultSelection(selectionData) {
                if (selectionData.isSelected) {
                    if (!this.selectedResults.includes(selectionData.resultId)) {
                        this.selectedResults.push(selectionData.resultId);
                    }
                } else {
                    this.selectedResults = this.selectedResults.filter(id => id !== selectionData.resultId);
                }
            },

        // Обработчик создания перетанцовки
        async handleCreateExtraRound() {
            if (!this.canCreateExtraRound) return;

            this.isLoading = true;
            try {
                const selectedContestantIds = this.milestoneResult
                    .filter(result => this.selectedResults.includes(result.id))
                    .map(result => result.contestant?.id)
                    .filter(id => id != null);

                const createRequest = {
                    milestoneId: this.milestone.id,
                    contestantIds: selectedContestantIds,
                }

                await roundApi.createExtraRound(createRequest);
                const selectedCount = this.selectedResults.length;
                this.selectedResults = [];
                await this.fillDetail(this.milestone.id);
            } catch (error) {
                console.error('Ошибка при сохранении изменений:', error);
                alert('Произошла ошибка при сохранении изменений');
            } finally {
                this.isLoading = false;
            }
        },
    }
}
</script>

<style scoped>

.milestone-detail-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
}

.header-container {
    background: white;
    padding: 15px 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content-container {
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
}

.milestone-result-details {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    padding: 30px;
}

.milestone-result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
    gap: 20px;
}

.header-left {
    flex: 1;
}

.milestone-result-title {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin: 0 0 10px 0;
    line-height: 1.2;
}

.header-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;
    white-space: nowrap;
}

.default-action-btn {
    background: #17a2b8;
    color: white;
}

.default-action-btn:hover {
    background: #1abdd6;
    color: white;
}
.contestant-tables-container {
    margin-top: 30px;
}

.single-table-layout {
    display: flex;
    justify-content: center;
}

.double-table-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
}

.no-data-message {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
    .double-table-layout {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .milestone-result-header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }
    
    .header-actions {
        justify-content: stretch;
    }
    
    .action-btn {
        flex: 1;
    }
}

.default-action-btn {
    background: #17a2b8;
    color: white;
}

.default-action-btn:hover {
    background: #1abdd6;
    color: white;
}

.disabled-action-btn {
    background: #6c757d;
    color: white;
    cursor: not-allowed;
    opacity: 0.6;
}

.disabled-action-btn:hover {
    background: #6c757d;
    color: white;
}
</style>