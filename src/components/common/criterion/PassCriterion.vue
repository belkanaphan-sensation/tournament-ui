<template>
    <div class="buttons-row">
        <button @click="setScore(1)" :class="['button', 'pass-button', { 
                  'pressed': 1 === this.initialResult?.score || undefined,
                  'no-pressed': 0 === this.initialResult?.score ||  undefined
                }]">Да
        </button>

        <button @click="setScore(0)" :class="['button', 'no-pass-button', { 
                  'pressed': 0 === this.initialResult?.score || undefined,
                  'no-pressed': 1 === this.initialResult?.score || undefined,
                }]">Нет
        </button>
    </div>
</template>

<script>

    export default {
        props: {
            initialResult: {
                type: Object
            },
            milestoneCriterionId: {
                type: Number
            }
        },

        methods: {
            setScore(score) {
                this.score = score;
                this.$emit("valueChange", {
                    score: this.score,
                    milestoneCriterionId: this.milestoneCriterionId
                });
            },
        },

        data() {
            return {
                
            }
        }
    }

</script>

<style scoped>
.buttons-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin: 15px 0;
}

.button {
    padding: 12px 24px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    color: #333;
    flex: 1;
    min-width: 80px;
    text-align: center;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Кнопка "Да" */
.pass-button {
    border-color: #28a745;
    color: #28a745;
}

.pass-button:hover {
    background-color: #f8fff9;
    border-color: #218838;
}

.pass-button.pressed {
    background: linear-gradient(135deg, #28a745, #218838);
    color: white;
    border-color: #1e7e34;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.pass-button.no-pressed {
    opacity: 0.6;
    transform: scale(0.95);
}

/* Кнопка "Нет" */
.no-pass-button {
    border-color: #dc3545;
    color: #dc3545;
}

.no-pass-button:hover {
    background-color: #fff5f5;
    border-color: #c82333;
}

.no-pass-button.pressed {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    border-color: #bd2130;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.no-pass-button.no-pressed {
    opacity: 0.6;
    transform: scale(0.95);
}

/* Кнопка "Возможно" */
.candidate-button {
    border-color: #ffc107;
    color: #ffc107;
}

.candidate-button:hover {
    background-color: #fffdf5;
    border-color: #e0a800;
}

.candidate-button.pressed {
    background: linear-gradient(135deg, #ffc107, #e0a800);
    color: white;
    border-color: #d39e00;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.candidate-button.no-pressed {
    opacity: 0.6;
    transform: scale(0.95);
}

/* Анимация нажатия */
.button.pressed {
    animation: pressAnimation 0.3s ease;
}

@keyframes pressAnimation {
    0% {
        transform: scale(0.95);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

/* Адаптивность */
@media (max-width: 480px) {
    .buttons-row {
        gap: 8px;
    }
    
    .button {
        padding: 10px 16px;
        font-size: 0.9rem;
        min-width: 70px;
    }
}
</style>