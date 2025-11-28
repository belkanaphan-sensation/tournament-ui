<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" @click="handleClose"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Подготовка раундов</h3>
                <button class="modal-close" @click="handleClose">×</button>
            </div>
            <div class="modal-body">
                <div class="info-section">
                    <div class="info-item">
                        <label>Этап:</label>
                        <span>{{ milestoneName }}</span>
                    </div>
                    <div class="info-item">
                        <label>Текущий лимит:</label>
                        <span>{{ currentRoundLimitDisplay }}</span>
                    </div>
                </div>
                <div class="input-group">
                    <label for="round-limit" class="required">Лимит участников на раунд</label>
                    <input
                        ref="limitInput"
                        id="round-limit"
                        type="number"
                        v-model.number="customRoundLimit"
                        class="limit-input"
                        placeholder="Введите лимит"
                        :class="{ 'error': limitError }"
                        min="1"
                        @input="handleLimitInput"
                    />
                    <div v-if="limitError" class="error-message">{{ limitError }}</div>
                    <div class="hint">Укажите максимальное количество участников в каждом раунде</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" @click="handleClose">Отменить</button>
                <button 
                    class="modal-btn confirm-btn" 
                    @click="handleConfirm"
                    :disabled="!isFormValid"
                >
                    Подготовить раунды
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PrepareRoundsModal',
    props: {
        show: {
            type: Boolean,
            required: true
        },
        milestoneName: {
            type: String,
            default: ''
        },
        milestoneRule: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            customRoundLimit: null,
            limitError: ''
        }
    },
    computed: {
        isFormValid() {
            return this.customRoundLimit > 0 && !this.limitError;
        },
        
        // Получаем текущий лимит из milestoneRule
        currentRoundLimit() {
            return this.milestoneRule?.roundContestantLimit || null;
        },
        
        // Отображаемое значение текущего лимита
        currentRoundLimitDisplay() {
            return this.currentRoundLimit ? this.currentRoundLimit : 'Не установлен';
        }
    },
    watch: {
        show: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    // Устанавливаем значение из milestoneRule или оставляем пустым
                    this.customRoundLimit = this.currentRoundLimit || '';
                    this.limitError = '';
                    
                    // Фокусируем на поле ввода после отрисовки модального окна
                    this.$nextTick(() => {
                        this.focusInput();
                    });
                }
            }
        },
        
        // Следим за изменением milestoneRule
        milestoneRule: {
            immediate: true,
            handler(newRule) {
                if (this.show && newRule) {
                    // Обновляем значение при изменении milestoneRule
                    this.customRoundLimit = newRule.roundContestantLimit || '';
                }
            }
        }
    },
    mounted() {
        // Если компонент монтируется с show=true, сразу фокусируем
        if (this.show) {
            this.$nextTick(() => {
                this.focusInput();
            });
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },

        handleConfirm() {
            if (this.validateForm()) {
                this.$emit('confirm', this.customRoundLimit);
            }
        },

        handleLimitInput() {
            this.validateLimit();
        },

        validateLimit() {
            this.limitError = '';
            
            if (!this.customRoundLimit && this.customRoundLimit !== 0) {
                this.limitError = 'Лимит обязателен для заполнения';
                return false;
            }
            
            if (this.customRoundLimit <= 0) {
                this.limitError = 'Лимит должен быть положительным числом';
                return false;
            }
            
            if (!Number.isInteger(this.customRoundLimit)) {
                this.limitError = 'Лимит должен быть целым числом';
                return false;
            }
            
            return true;
        },

        validateForm() {
            return this.validateLimit();
        },

        // Фокусировка на поле ввода
        focusInput() {
            if (this.$refs.limitInput) {
                this.$refs.limitInput.focus();
                
                // Если есть текст в поле, выделяем его для удобства замены
                if (this.customRoundLimit) {
                    this.$refs.limitInput.select();
                }
            }
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

.info-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    margin-bottom: 8px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item label {
    font-weight: 600;
    color: #333;
    min-width: 120px;
    margin-right: 10px;
}

.info-item span {
    color: #666;
}

.input-group {
    margin-bottom: 10px;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.input-group label.required::after {
    content: " *";
    color: #dc3545;
}

.limit-input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
}

.limit-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.limit-input.error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 0.85rem;
    margin-top: 5px;
}

.hint {
    color: #666;
    font-size: 0.85rem;
    margin-top: 5px;
    font-style: italic;
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

.confirm-btn {
    background: #007bff;
    color: white;
}

.confirm-btn:hover:not(:disabled) {
    background: #0056b3;
}

.confirm-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>