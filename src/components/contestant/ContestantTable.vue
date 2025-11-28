<template>
    <div class="contestant-table">
        <h3 class="table-title">{{ title }}</h3>
        <div class="table-container">
            <table class="contestant-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Номер</th>
                        <th v-if="showPartnerSides">Участники</th>
                        <th>Финальное решение</th>
                        <th>Судейское решение</th>
                        <th>Баллы</th>
                        <th>Перетанцовка</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="result in contestants" :key="result.id">
                        <tr class="main-row" @click="toggleRowExpand(result.id)">
                            <td class="expand-icon">
                                <span class="icon" :class="{ expanded: expandedRows.has(result.id) }">
                                    ▶
                                </span>
                            </td>
                            <td>{{ result.contestant?.number }}</td>
                            <td v-if="showPartnerSides">
                                <div v-for="participant in result.contestant?.participants" 
                                     :key="participant.participantId"
                                     class="participant-info">
                                    {{ participant.name }} {{ participant.surname }} 
                                    ({{ getPartnerSideLabel(participant.partnerSide) }})
                                </div>
                            </td>
                            <td>
                                <select 
                                    v-model="result.finallyApproved"
                                    @change="onFinalDecisionChange(result)"
                                    :class="['decision-select', getFinalStatusClass(result.finallyApproved)]"
                                    @click.stop
                                >
                                    <option :value="true">Прошел</option>
                                    <option :value="false">Не прошел</option>
                                </select>
                            </td>
                            <td>
                                <span :class="['status-badge', getJudgeStatusClass(result.judgePassed)]">
                                    {{ getJudjeStatusDisplayValue(result) }}
                                </span>
                            </td>
                            <td>{{ getTotalScore(result) }}</td>
                            <td>
                                <span :class="['extra-round-icon', getHasExtraRoundStatusClass(result)]">
                                    {{ hasExtraRoundDisplayValue(result) }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="expandedRows.has(result.id)" class="detail-row">
                            <td colspan="7" class="rounds-details">
                                <div class="rounds-container">
                                    <table class="rounds-table">
                                        <thead>
                                            <tr>
                                                <th>Название раунда</th>
                                                <th>Тип раунда</th>
                                                <th>Баллы</th>
                                                <th>Статус</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="roundResult in result.milestoneRoundResults" 
                                                :key="roundResult.id"
                                                class="round-row">
                                                <td class="round-name">{{ roundResult.round?.value || 'Раунд' }}</td>
                                                <td>
                                                    <span :class="['round-type', roundResult.fromExtraRound ? 'extra-round' : 'main-round']">
                                                        {{ roundResult.fromExtraRound ? 'Перетанцовка' : 'Основной раунд' }}
                                                    </span>
                                                </td>
                                                <td class="round-score">{{ roundResult.totalScore || 0 }}</td>
                                                <td>
                                                    <span :class="['status-badge', 'small-badge', getJudgeStatusClass(roundResult.judgePassed)]">
                                                        {{ getJudjeStatusDisplayValue(roundResult) }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div v-if="!result.milestoneRoundResults?.length" class="no-rounds">
                                        Нет данных о раундах
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { passStatusEnum } from '../../utils/EnumLocalizator.js'

export default {
    name: 'ContestantTable',
    props: {
        contestants: {
            type: Array,
            default: () => []
        },
        title: {
            type: String,
            default: 'Конкурсанты'
        },
        showPartnerSides: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            expandedRows: new Set() // Храним ID развернутых строк
        }
    },
    methods: {
        getPartnerSideLabel(side) {
            const labels = {
                'LEADER': 'Лидер',
                'FOLLOWER': 'Фолловер'
            };
            return labels[side] || side;
        },
        
        getFinalStatusClass(status) {
            if (status === true) return 'status-passed';
            if (status === false) return 'status-failed';
            return 'status-pending';
        },

        getJudgeStatusClass(status) {
            if (status === 'PASSED') return 'status-passed';
            if (status === 'PENDING') return 'status-pending';
            if (status === 'FAILED') return 'status-failed';
            return 'status-pending';
        },
        
        getHasExtraRoundStatusClass(result) {
            const val = this.hasExtraRound(result);
            if (val === true) return 'status-passed';
            return ''; // возвращаем пустую строку если false
        },

        getStatusLabel(status) {
            if (status === true) return 'Прошел';
            if (status === false) return 'Не прошел';
            return 'На рассмотрении';
        },

        getJudjeStatusDisplayValue(result) {
            return passStatusEnum[result?.judgePassed] || 'Неизвестный статус';
        },
        
        getTotalScore(result) {
            return result.milestoneRoundResults?.reduce((total, round) => {
                if (round.fromExtraRound === true) {
                    return total; // Пропускаем экстра-раунды
                }
                return total + (round.totalScore || 0);
            }, 0) || 0;
        },

        hasExtraRound(result) {
            return result.milestoneRoundResults?.some(round => round.fromExtraRound === true) || false;
        },

        hasExtraRoundDisplayValue(result) {
            const val = this.hasExtraRound(result);
            return val === true ? '✓' : ''; // возвращаем галочку или пустую строку
        },

        // Переключение развертывания строки
        toggleRowExpand(resultId) {
            if (this.expandedRows.has(resultId)) {
                this.expandedRows.delete(resultId);
            } else {
                this.expandedRows.add(resultId);
            }
        },

        // Обработчик изменения финального решения
        onFinalDecisionChange(result) {
            this.$emit('final-decision-changed', result);
        }
    }
}
</script>

<style scoped>
.contestant-table {
    background: white;
    border-radius: 8px;
    padding: 20px 0px 20px 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-title {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.3rem;
    font-weight: 600;
}

.table-container {
    overflow-x: auto;
}

.contestant-table {
    width: 100%;
    border-collapse: collapse;
}

.contestant-table th,
.contestant-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
}

.contestant-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
}

.participant-info {
    margin: 2px 0;
    font-size: 0.9rem;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    display: inline-block;
    min-width: 120px;
    text-align: center;
}

.small-badge {
    min-width: 100px;
    font-size: 0.75rem;
    padding: 3px 6px;
}

.extra-round-icon {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    min-width: 120px;
    text-align: center;
}

.status-passed {
    background-color: #d4edda;
    color: #155724;
}

.status-failed {
    background-color: #f8d7da;
    color: #721c24;
}

.status-pending {
    background-color: #fff3cd;
    color: #856404;
}

.decision-select {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    border: none;
    outline: none;
    min-width: 120px;
    cursor: pointer;
    text-align: center;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23333' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 8px;
    padding-right: 24px;
}

.decision-select.status-passed {
    background-color: #d4edda;
    color: #155724;
}

.decision-select.status-failed {
    background-color: #f8d7da;
    color: #721c24;
}

.decision-select:focus {
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Стили для разворачиваемых строк */
.main-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.main-row:hover {
    background-color: #f8f9fa;
}

.expand-icon {
    width: 30px;
    text-align: center;
}

.expand-icon .icon {
    display: inline-block;
    transition: transform 0.3s ease;
    font-size: 0.7rem;
    color: #666;
}

.expand-icon .icon.expanded {
    transform: rotate(90deg);
}

.detail-row {
    background-color: #fafafa;
}

.rounds-details {
    padding: 0 !important;
}

.rounds-container {
    padding: 20px;
    background-color: #f8f9fa;
}

.rounds-title {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
    padding-left: 10px;
}

.rounds-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.rounds-table th {
    background-color: #e9ecef;
    padding: 12px 15px;
    font-weight: 600;
    color: #495057;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
}

.rounds-table td {
    padding: 12px 15px;
    border-bottom: 1px solid #f1f1f1;
}

.round-row:hover {
    background-color: #f8f9fa;
}

.round-name {
    font-weight: 600;
    color: #333;
}

.round-score {
    font-weight: 500;
    color: #495057;
}

.round-type {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    display: inline-block;
}

.round-type.main-round {
    background-color: #e3f2fd;
    color: #1565c0;
}

.round-type.extra-round {
    background-color: #fff3e0;
    color: #ef6c00;
}

.no-rounds {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px;
    background: white;
    border-radius: 8px;
}

/* Стили для опций в выпадающем списке */
.decision-select option {
    background: white;
    color: #333;
    padding: 8px;
}
</style>