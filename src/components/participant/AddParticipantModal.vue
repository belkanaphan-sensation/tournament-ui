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
export default {
    name: 'AddParticipantModal',
    props: {
        show: {
            type: Boolean,
            required: true
        },
        activityId: {
            type: [String, Number],
            required: true
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
                partnerSide: ''
            },
            errors: {
                surname: '',
                name: '',
                email: '',
                partnerSide: ''
            }
        }
    },
    computed: {
        isFormValid() {
            return this.formData.surname.trim() && 
                   this.formData.name.trim() && 
                   this.formData.partnerSide;
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.resetForm();
            }
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },

        handleAdd() {
            if (this.validateForm()) {
                this.$emit('add', {
                    surname: this.formData.surname.trim(),
                    name: this.formData.name.trim(),
                    secondName: this.formData.secondName.trim(),
                    email: this.formData.email.trim(),
                    phoneNumber: this.formData.phoneNumber.trim(),
                    school: this.formData.school.trim(),
                    partnerSide: this.formData.partnerSide,
                    activityId: Number(this.activityId),
                });
            }
        },

        validateForm() {
            this.errors = {
                surname: '',
                name: '',
                email: '',
                partnerSide: ''
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
                partnerSide: ''
            };
            this.errors = {
                surname: '',
                name: '',
                email: '',
                partnerSide: ''
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