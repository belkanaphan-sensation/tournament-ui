<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" @click="handleClose"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Сравнение результатов судей</h3>
                <button class="modal-close" @click="handleClose">×</button>
            </div>
            <div class="modal-body">
                <LoadingOverlay :isLoading="isLoading" />
                
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                
                <div v-else class="results-container">
                    <div v-for="contestantData in contestantsData" 
                         :key="contestantData.contestantId"
                         class="contestant-section">
                        <h4 class="contestant-title">
                            Конкурсант #{{ getContestantNumber(contestantData.contestantId) }}
                        </h4>
                        
                        <div class="table-wrapper">
                            <table class="judge-results-table">
                                <thead>
                                    <tr>
                                        <th>Критерий</th>
                                        <th>Раунд</th>
                                        <th>Сумма оценок</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="criterion in contestantData.aggregatedResults" 
                                        :key="`${criterion.criterionId}-${criterion.roundId || 'default'}`"
                                        class="result-row">
                                        <td class="criterion-name">
                                            {{ criterion.criterionName || 'Не указан' }}
                                        </td>
                                        <td class="round-cell">
                                            {{ criterion.roundName || 'Основной' }}
                                        </td>
                                        <td class="score-cell">
                                            <span :class="['score-badge', getScoreClass(criterion.totalScore)]">
                                                {{ criterion.totalScore }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>

                                
                            </table>

                            <!-- <div class="contestant-summary">
                                <div class="summary-item">
                                    <span class="summary-label">Всего баллов:</span>
                                    <span class="summary-value">{{ getTotalScoreScore(contestantData) }}</span>
                                </div>
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" @click="handleClose">Закрыть</button>
            </div>
        </div>
    </div>
</template>

<script>
import { judgeResultApi } from '@/services/judgeResultApi.js';
import LoadingOverlay from '../common/LoadingOverlay.vue';

export default {
    name: 'CompareJudgeResultsModal',
    components: {
        LoadingOverlay
    },
    props: {
        show: {
            type: Boolean,
            required: true
        },
        contestantIds: {
            type: Array,
            default: () => []
        },
        milestoneResult: {
            type: Array,
            default: () => []
        },
        milestoneId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            isLoading: false,
            error: null,
            contestantsData: [] // { contestantId, aggregatedResults: [] }
        }
    },
    watch: {
        show: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.loadJudgeResults();
                }
            }
        }
    },
    methods: {
        async loadJudgeResults() {
            if (!this.contestantIds.length) {
                this.error = 'Не выбраны конкурсанты для сравнения';
                return;
            }

            this.isLoading = true;
            this.error = null;
            this.contestantsData = [];
            
            try {
                const results = await judgeResultApi.getJudgeMilestoneResultsByContestantId(this.contestantIds, this.milestoneId)
                
                // Формируем агрегированные данные для отображения
                this.contestantsData = this.aggregateResultsByCriterionAndRound(results || []);
                
            } catch (err) {
                console.error('Ошибка при загрузке результатов судей:', err);
                this.error = 'Не удалось загрузить результаты судей';
            } finally {
                this.isLoading = false;
            }
        },

        // Агрегируем результаты по критериям и раундам
        aggregateResultsByCriterionAndRound(results) {
            const contestantMap = {};

            results.forEach(result => {
                const contestantId = result.contestant?.id;
                const criterionId = result.milestoneCriterion?.id;
                const criterionName = result.milestoneCriterion?.value || 'Не указан';
                const roundId = result.round?.id;
                const roundName = result.round?.value || 'Основной';
                const score = result.score || 0;

                // Инициализируем запись для конкурсанта, если ее нет
                if (!contestantMap[contestantId]) {
                    contestantMap[contestantId] = {
                        contestantId: contestantId,
                        aggregatedResults: {}
                    };
                }

                // Создаем ключ для комбинации критерий-раунд
                const criterionRoundKey = `${criterionId}-${roundId || 'default'}`;

                // Если такой комбинации еще нет, создаем новую запись
                if (!contestantMap[contestantId].aggregatedResults[criterionRoundKey]) {
                    contestantMap[contestantId].aggregatedResults[criterionRoundKey] = {
                        criterionId: criterionId,
                        criterionName: criterionName,
                        roundId: roundId,
                        roundName: roundName,
                        totalScore: 0
                    };
                }

                // Суммируем баллы
                contestantMap[contestantId].aggregatedResults[criterionRoundKey].totalScore += score;
            });

            // Преобразуем объект в массив
            return Object.values(contestantMap).map(contestantData => ({
                contestantId: contestantData.contestantId,
                aggregatedResults: Object.values(contestantData.aggregatedResults)
            }));
        },
        
        getContestantNumber(contestantId) {
            // Находим номер конкурсанта из исходных данных
            const result = this.milestoneResult.find(r => r.contestant?.id === contestantId);
            return result?.contestant?.number || contestantId;
        },
        
        getScoreClass(score) {
            return 'score-high';
        },

        // getTotalScoreScore(contestantData) {
        //     return contestantData && contestantData.aggregatedResults ? contestantData.aggregatedResults.;
        // },
        
        handleClose() {
            this.$emit('close');
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: modal-appear 0.3s ease-out;
    position: relative;
    z-index: 1001;
    display: flex;
    flex-direction: column;
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #e0e0e0;
}

.modal-title {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: #f5f5f5;
    color: #333;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 25px;
    position: relative;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 20px 25px;
    border-top: 1px solid #e0e0e0;
}

.modal-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 100px;
}

.cancel-btn {
    background: #6c757d;
    color: white;
}

.cancel-btn:hover {
    background: #5a6268;
}

/* Стили для контейнера результатов */
.results-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.contestant-section {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.contestant-title {
    background: #17a2b8;
    color: white;
    margin: 0;
    padding: 15px 20px;
    font-size: 1.1rem;
}

.table-wrapper {
    overflow-x: auto;
}

.judge-results-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

.judge-results-table th {
    background: #f8f9fa;
    padding: 12px 15px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 1px solid #dee2e6;
}

.judge-results-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #f1f1f1;
}

.result-row:hover {
    background-color: #f8f9fa;
}

.criterion-name {
    font-weight: 500;
    color: #333;
}

.round-cell {
    color: #666;
    font-style: italic;
}

.score-cell {
    text-align: center;
}

.score-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
}

.score-high {
    background: #d4edda;
    color: #155724;
}

.score-medium {
    background: #fff3cd;
    color: #856404;
}

.score-low {
    background: #ffeaa7;
    color: #856404;
}

.error-message {
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
    margin: 20px 0;
}

.contestant-summary {
    display: flex;
    gap: 20px;
    padding: 15px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
    flex-wrap: wrap;
}

.summary-item {
    display: flex;
    gap: 8px;
    align-items: center;
}

.summary-label {
    font-weight: 600;
    color: #495057;
}

.summary-value {
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    font-weight: 500;
}

</style>