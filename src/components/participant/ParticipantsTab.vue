<template>
    <div class="tab-pane">
        <div class="section-header">
            <h2 class="section-title">{{ tabTitle }}</h2>
            <div class="participants-count">{{ participants.length }} участников</div>
        </div>

        <div class="participants-table-container">
            <table class="participants-table">
                <thead>
                    <tr>
                        <th class="selection-column">
                            <input 
                                type="checkbox" 
                                :checked="isAllSelected"
                                @change="$emit('toggleSelectAll')"
                            >
                        </th>
                        <th>ФИО</th>
                        <th>Email</th>
                        <th>Телефон</th>
                        <th>Номер</th>
                        <th>Статус регистрации</th>
                        <th class="actions-column">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="participant in participants" 
                        :key="participant.id"
                        :class="{ 'selected': selectedParticipants.includes(participant.id) }"
                    >
                        <td class="selection-column">
                            <input 
                                type="checkbox" 
                                :value="participant.id"
                                :checked="selectedParticipants.includes(participant.id)"
                                @change="handleParticipantSelection(participant.id, $event.target.checked)"
                            >
                        </td>
                        <td>
                            <div class="participant-name">
                                {{ getFullName(participant) }}
                            </div>
                        </td>
                        <td>{{ getEmail(participant)}}</td>
                        <td>{{ getPhoneNumber(participant)}}</td>
                        <td>
                            <span>{{ participant.number || 'Не указан' }}</span>
                        </td>
                        <td>
                            <span class="registration-status" :class="participant.isRegistered ? 'registered' : 'not-registered'">
                                {{ participant.isRegistered ? 'Зарегистрирован' : 'Не зарегистрирован' }}
                            </span>
                        </td>
                        <td class="actions-column">
                            <button 
                                v-if="!participant.isRegistered"
                                class="action-btn primary-btn small-btn"
                                @click="$emit('openRegisterModal', participant)"
                                :disabled="!showActionPanel"
                            >
                                Зарегистрировать
                            </button>
                            <button 
                                v-else
                                class="action-btn warning-btn small-btn"
                                @click="$emit('unregisterSingleParticipant', participant)"
                                :disabled="!showActionPanel"
                            >
                                Отменить регистрацию
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div v-if="participants.length === 0 && !isLoading" class="empty-participants">
                <div class="empty-icon">{{ emptyIcon }}</div>
                <h3>{{ emptyTitle }}</h3>
                <p>{{ emptyDescription }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ParticipantsTab',
    props: {
        participants: {
            type: Array,
            required: true
        },
        selectedParticipants: {
            type: Array,
            required: true
        },
        showActionPanel: {
            type: Boolean,
            required: true
        },
        isLoading: {
            type: Boolean,
            required: true
        },
        tabTitle: {
            type: String,
            required: true
        },
        emptyIcon: {
            type: String,
            required: true
        },
        emptyTitle: {
            type: String,
            required: true
        },
        emptyDescription: {
            type: String,
            required: true
        }
    },
    computed: {
        isAllSelected() {
            return this.participants.length > 0 && 
                   this.participants.every(p => this.selectedParticipants.includes(p.id));
        }
    },
    methods: {
        getFullName(participant) {
            return `${participant?.person?.surname} ${participant?.person?.name} ${participant?.person?.secondName || ''}`.trim();
        },

        getEmail(participant) {
            return participant?.person?.email || 'Не указан';
        },

        getPhoneNumber(participant) {
            return participant?.person?.phoneNumber || 'Не указан';
        },

        handleParticipantSelection(participantId, isSelected) {
            let newSelected = [...this.selectedParticipants];
            
            if (isSelected) {
                if (!newSelected.includes(participantId)) {
                    newSelected.push(participantId);
                }
            } else {
                newSelected = newSelected.filter(id => id !== participantId);
            }
            
            this.$emit('update:selectedParticipants', newSelected);
        }
    }
}
</script>

<style scoped>
.tab-pane {
    padding: 0;
}

.tab-pane .section-header {
    padding: 20px 25px 15px;
    margin-bottom: 0;
    border-bottom: 1px solid #f0f0f0;
}

.tab-pane .participants-table-container {
    border: none;
    border-radius: 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
}

.section-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    margin: 0;
}

.participants-count {
    color: #666;
    font-size: 0.95rem;
    font-weight: 500;
}

.participants-table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.participants-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
}

.participants-table th,
.participants-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    white-space: nowrap;
}

.participants-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
}

.participants-table tbody tr:hover {
    background: #f8f9fa;
}

.participants-table tbody tr.selected {
    background: #e3f2fd;
}

.selection-column {
    width: 40px;
    text-align: center;
}

.selection-column input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

.actions-column {
    width: 150px;
    text-align: center;
}

.participant-name {
    font-weight: 500;
    color: #333;
}

.registration-status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    display: inline-block;
    min-width: 140px;
    text-align: center;
    box-sizing: border-box;
}

.registration-status.registered {
    background: #e8f5e8;
    color: #2e7d32;
}

.registration-status.not-registered {
    background: #ffebee;
    color: #c62828;
}

.empty-participants {
    text-align: center;
    padding: 60px 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.empty-participants .empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

.empty-participants h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.3rem;
}

.empty-participants p {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.5;
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

.primary-btn {
    background: #007bff;
    color: white;
}

.primary-btn:hover:not(:disabled) {
    background: #0056b3;
}

.warning-btn {
    background: #ffc107;
    color: #212529;
}

.warning-btn:hover:not(:disabled) {
    background: #e0a800;
}

.small-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    min-width: 60px;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.action-btn:disabled:hover {
    background: inherit;
    color: inherit;
}
</style>