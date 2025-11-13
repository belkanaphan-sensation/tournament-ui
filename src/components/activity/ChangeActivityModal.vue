<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Изменить активность</h3>
                <button class="modal-close" @click="handleClose">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="currentActivity">Из активности</label>
                    <input
                        id="currentActivity"
                        type="text"
                        :value="currentActivityName"
                        class="form-input"
                        disabled
                    />
                </div>

                <div class="form-group">
                    <label for="newActivity" class="required">В активность</label>
                    <select
                        id="newActivity"
                        v-model="selectedActivityId"
                        class="form-input"
                        :class="{ 'error': errors.newActivity }"
                        @change.prevent.stop
                    >
                        <option value="">Выберите активность</option>
                        <option 
                            v-for="activity in availableActivities" 
                            :key="activity.id" 
                            :value="activity.id"
                        >
                            {{ activity.value }}
                        </option>
                    </select>
                    <div v-if="errors.newActivity" class="error-message">{{ errors.newActivity }}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" @click="handleClose">Отменить</button>
                <button 
                    class="modal-btn primary-btn" 
                    @click="handleChange"
                    :disabled="!isFormValid"
                >
                    Изменить
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { activityApi } from '@/services/activityApi.js';

export default {
    name: 'ChangeActivityModal',
    props: {
        show: {
            type: Boolean,
            required: true
        },
        currentActivityId: {
            type: [String, Number],
            required: true
        },
        currentActivityName: {
            type: String,
            required: true
        },
        participantId: {
            type: [String, Number],
            required: true
        },
        occasionId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            availableActivities: [],
            selectedActivityId: '',
            errors: {
                newActivity: ''
            },
            isLoading: false
        }
    },
    computed: {
        isFormValid() {
            return !!this.selectedActivityId;
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.resetForm();
                this.loadAvailableActivities();
            }
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },

        handleSelectChange(event) {
            // Обновляем значение, но НЕ вызываем handleChange
            this.selectedActivityId = event.target.value;
            console.log('Selected activity:', this.selectedActivityId);
        },

        handleChange() {
            // Этот метод вызывается только при нажатии кнопки "Изменить"
            if (this.validateForm()) {
                this.$emit('change', {
                    participantId: this.participantId,
                    newActivityId: this.selectedActivityId
                });
            }
        },

        validateForm() {
            this.errors = {
                newActivity: ''
            };

            let isValid = true;

            if (!this.selectedActivityId) {
                this.errors.newActivity = 'Выберите активность для переноса';
                isValid = false;
            }

            return isValid;
        },

        async loadAvailableActivities() {
            this.isLoading = true;
            try {
                // Получаем список доступных активностей с сервера
                this.availableActivities = await activityApi.getPlannedActivityEntityLinkByOccasionId(this.occasionId);
                
                // Фильтруем текущую активность из списка
                this.availableActivities = this.availableActivities.filter(
                    activity => activity.id !== this.currentActivityId
                );
            } catch (error) {
                console.error('Error loading available activities:', error);
                this.availableActivities = [];
            } finally {
                this.isLoading = false;
            }
        },

        resetForm() {
            this.selectedActivityId = '';
            this.errors = {
                newActivity: ''
            };
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
    width: 500px;
    max-width: 90vw;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: modal-appear 0.3s ease-out;
    position: relative;
    z-index: 1001;
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
    padding: 25px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.form-group label.required::after {
    content: " *";
    color: #dc3545;
}

.form-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.form-input:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
}

.form-input.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 5px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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

.primary-btn {
    background: #007bff;
    color: white;
}

.primary-btn:hover:not(:disabled) {
    background: #0056b3;
}

.primary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>