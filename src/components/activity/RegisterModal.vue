<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" ></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Регистрация участника</h3>
                <button class="modal-close" @click="handleClose">×</button>
            </div>
            <div class="modal-body">
                <div class="participant-info">
                    <div class="info-item">
                        <label>ФИО:</label>
                        <span>{{ getFullName(participant) }}</span>
                    </div>
                </div>
                <div class="number-input-group">
                    <label for="participant-number" class="required">Номер участника</label>
                    <input
                        ref="numberInput"
                        id="participant-number"
                        type="text"
                        v-model="participantNumber"
                        class="number-input-modal"
                        placeholder="Введите номер"
                        :class="{ 'error': numberError }"
                        @input="handleNumberInput"
                    />
                    <div v-if="numberError" class="error-message">{{ numberError }}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" @click="handleClose">Отменить</button>
                <button 
                    class="modal-btn confirm-btn" 
                    @click="handleConfirm"
                    :disabled="!participantNumber.trim() || numberError.length > 0"
                >
                    Подтвердить
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RegisterModal',
    props: {
        participant: {
            type: Object,
            required: true
        },
        show: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            participantNumber: '',
            numberError: ''
        }
    },
    watch: {
        show: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.participantNumber = this.participant?.number || '';
                    this.numberError = '';
                    
                    // Фокусируем на поле ввода после отрисовки модального окна
                    this.$nextTick(() => {
                        this.focusInput();
                    });
                }
            }
        },
        participant: {
            immediate: true,
            handler(newParticipant) {
                if (this.show && newParticipant) {
                    this.participantNumber = newParticipant?.number || '';
                    this.numberError = '';
                    
                    this.$nextTick(() => {
                        this.focusInput();
                    });
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
        getFullName(participant) {
            return `${participant?.person?.surname} ${participant?.person?.name} ${participant?.person?.secondName || ''}`.trim();
        },

        handleClose() {
            this.$emit('close');
        },

        handleConfirm() {
            this.$emit('confirm', this.participantNumber.trim());
        },

        handleNumberInput() {
            this.validateNumber();
        },

        validateNumber() {
            // Всегда очищаем ошибку при валидации
            this.numberError = '';
            
            if (!this.participantNumber.trim()) {
                this.numberError = 'Номер участника обязателен для заполнения';
                return false;
            }
            
            return true;
        },

        // Метод для установки ошибки из родительского компонента
        setNumberError(errorMessage) {
            this.numberError = errorMessage;
        },

        // Фокусировка на поле ввода
        focusInput() {
            if (this.$refs.numberInput) {
                this.$refs.numberInput.focus();
                
                // Если есть текст в поле, выделяем его для удобства замены
                if (this.participantNumber) {
                    this.$refs.numberInput.select();
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

.participant-info {
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
    min-width: 80px;
    margin-right: 10px;
}

.info-item span {
    color: #666;
}

.number-input-group {
    margin-bottom: 10px;
}

.number-input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
}

.number-input-group label.required::after {
    content: " *";
    color: #dc3545;
}

.number-input-modal {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
}

.number-input-modal:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.number-input-modal.error {
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