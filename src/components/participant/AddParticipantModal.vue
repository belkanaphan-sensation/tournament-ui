<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-backdrop" @click="handleClose"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Добавить участника</h3>
                <button class="modal-close" @click="handleClose">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="surname" class="required">Фамилия</label>
                    <input
                        id="surname"
                        type="text"
                        v-model="formData.surname"
                        class="form-input"
                        placeholder="Введите фамилию"
                        :class="{ 'error': errors.surname }"
                    />
                    <div v-if="errors.surname" class="error-message">{{ errors.surname }}</div>
                </div>

                <div class="form-group">
                    <label for="name" class="required">Имя</label>
                    <input
                        id="name"
                        type="text"
                        v-model="formData.name"
                        class="form-input"
                        placeholder="Введите имя"
                        :class="{ 'error': errors.name }"
                    />
                    <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
                </div>

                <div class="form-group">
                    <label for="secondName">Отчество</label>
                    <input
                        id="secondName"
                        type="text"
                        v-model="formData.secondName"
                        class="form-input"
                        placeholder="Введите отчество"
                    />
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        v-model="formData.email"
                        class="form-input"
                        placeholder="Введите email"
                        :class="{ 'error': errors.email }"
                    />
                    <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
                </div>

                <div class="form-group">
                    <label for="phoneNumber">Телефон</label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        v-model="formData.phoneNumber"
                        class="form-input"
                        placeholder="Введите телефон"
                    />
                </div>

                <div class="form-group">
                    <label for="school">Школа</label>
                    <input
                        id="school"
                        type="text"
                        v-model="formData.school"
                        class="form-input"
                        placeholder="Введите название школы"
                    />
                </div>

                <div class="form-group">
                    <label for="partnerSide" class="required">Сторона</label>
                    <select
                        id="partnerSide"
                        v-model="formData.partnerSide"
                        class="form-input"
                        :class="{ 'error': errors.partnerSide }"
                    >
                        <option value="">Выберите сторону</option>
                        <option value="LEADER">Партнер</option>
                        <option value="FOLLOWER">Партнерша</option>
                    </select>
                    <div v-if="errors.partnerSide" class="error-message">{{ errors.partnerSide }}</div>
                </div>

                <div v-if="withAssistant" class="form-group">
                    <Picker
                        v-model="formData.assistant"
                        label="Ассистент"
                        required
                        placeholder="Фамилия или имя ассистента..."
                        :search="searchAssistants"
                        :error="errors.assistant"
                    />
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn cancel-btn" @click="handleClose">Отменить</button>
                <button 
                    class="modal-btn success-btn" 
                    @click="handleAdd"
                    :disabled="!isFormValid"
                >
                    Добавить
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import Picker from '../common/Picker.vue';
import { assistantApi } from '@/services/assistantApi.js';

function formatAssistantLabel(assistant) {
    const person = assistant?.person || {};
    const parts = [person.surname, person.name, person.secondName].filter(Boolean);
    return parts.join(' ') || String(assistant?.id ?? '');
}

function toAssistantOption(assistant) {
    return {
        id: assistant.id,
        value: formatAssistantLabel(assistant),
        partnerSide: assistant.partnerSide,
    };
}

export default {
    name: 'AddParticipantModal',
    components: {
        Picker,
    },
    props: {
        show: {
            type: Boolean,
            required: true
        },
        activityId: {
            type: [String, Number],
            required: true
        },
        withAssistant: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            formData: {
                surname: '',
                name: '',
                secondName: '',
                email: '',
                phoneNumber: '',
                school: '',
                partnerSide: '',
                assistant: null,
            },
            errors: {
                surname: '',
                name: '',
                email: '',
                partnerSide: '',
                assistant: ''
            },
        }
    },
    computed: {
        isFormValid() {
            const baseValid = this.formData.surname.trim() &&
                   this.formData.name.trim() &&
                   this.formData.partnerSide;
            if (!this.withAssistant) {
                return !!baseValid;
            }
            return !!baseValid && !!this.formData.assistant?.id;
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.resetForm();
            }
        },
        'formData.partnerSide'() {
            // при смене стороны сбрасываем ассистента, если сторона не совпадает
            if (
                this.formData.assistant?.partnerSide &&
                this.formData.partnerSide &&
                this.formData.assistant.partnerSide !== this.formData.partnerSide
            ) {
                this.formData.assistant = null;
            }
        }
    },
    methods: {
        async searchAssistants(query) {
            const list = await assistantApi.getAll() || [];
            const all = Array.isArray(list) ? list.map(toAssistantOption) : [];
            const q = (query || '').trim().toLowerCase();
            return all.filter((item) => {
                if (
                    this.formData.partnerSide &&
                    item.partnerSide &&
                    item.partnerSide !== this.formData.partnerSide
                ) {
                    return false;
                }
                if (!q) {
                    return true;
                }
                return String(item.value || '').toLowerCase().includes(q);
            });
        },

        handleClose() {
            this.$emit('close');
        },

        handleAdd() {
            if (this.validateForm()) {
                const payload = {
                    surname: this.formData.surname.trim(),
                    name: this.formData.name.trim(),
                    secondName: this.formData.secondName.trim(),
                    email: this.formData.email.trim(),
                    phoneNumber: this.formData.phoneNumber.trim(),
                    school: this.formData.school.trim(),
                    partnerSide: this.formData.partnerSide,
                    activityId: Number(this.activityId),
                };
                if (this.withAssistant && this.formData.assistant?.id) {
                    payload.assistantId = this.formData.assistant.id;
                }
                this.$emit('add', payload);
            }
        },

        validateForm() {
            this.errors = {
                surname: '',
                name: '',
                email: '',
                partnerSide: '',
                assistant: ''
            };

            let isValid = true;

            if (!this.formData.surname.trim()) {
                this.errors.surname = 'Фамилия обязательна для заполнения';
                isValid = false;
            }

            if (!this.formData.name.trim()) {
                this.errors.name = 'Имя обязательно для заполнения';
                isValid = false;
            }

            if (this.formData.email.length > 0) {
                if (!this.isValidEmail(this.formData.email)) {
                    this.errors.email = 'Введите корректный email';
                    isValid = false;
                }
            }

            if (!this.formData.partnerSide) {
                this.errors.partnerSide = 'Выберите сторону';
                isValid = false;
            }

            if (this.withAssistant && !this.formData.assistant?.id) {
                this.errors.assistant = 'Выберите ассистента';
                isValid = false;
            }

            return isValid;
        },

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        resetForm() {
            this.formData = {
                surname: '',
                name: '',
                secondName: '',
                email: '',
                phoneNumber: '',
                school: '',
                partnerSide: '',
                assistant: null,
            };
            this.errors = {
                surname: '',
                name: '',
                email: '',
                partnerSide: '',
                assistant: ''
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
    max-height: 90vh;
    overflow-y: auto;
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

.success-btn {
    background: #28a745;
    color: white;
}

.success-btn:hover:not(:disabled) {
    background: #218838;
}

.success-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
