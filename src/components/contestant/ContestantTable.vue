<template>
    <div class="contestant-table">
        <h3 class="table-title">{{ title }}</h3>
        <div class="table-container">
            <table class="contestant-table">
                <thead>
                    <tr>
                        <th>Номер</th>
                        <th v-if="showPartnerSides">Участники</th>
                        <th>Результат Нужно как то еще добавить сюда RoundResult</th>
                        <th>Баллы</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="result in contestants" :key="result.id">
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
                            <span :class="['status-badge', getStatusClass(result.finallyApproved)]">
                                {{ getStatusLabel(result.finallyApproved) }}
                            </span>
                        </td>
                        <td>{{ getTotalScore(result) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
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
    methods: {
        getPartnerSideLabel(side) {
            const labels = {
                'LEADER': 'Лидер',
                'FOLLOWER': 'Фолловер'
            };
            return labels[side] || side;
        },
        
        getStatusClass(status) {
            if (status === true) return 'status-passed';
            if (status === false) return 'status-failed';
            return 'status-pending';
        },
        
        getStatusLabel(status) {
            if (status === true) return 'Прошел';
            if (status === false) return 'Не прошел';
            return 'На рассмотрении';
        },
        
        getTotalScore(result) {
            // Суммируем баллы из всех раундов этапа
            return result.milestoneRoundResults?.reduce((total, round) => 
                total + (round.totalScore || 0), 0) || 0;
        },
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

.edit-btn {
    padding: 6px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.edit-btn:hover {
    background-color: #0056b3;
}
</style>