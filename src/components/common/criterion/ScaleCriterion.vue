<template>
    <div class="buttons-row">
        <button v-for="number in milestoneCriterion.scale" :key="number" :class="['button', 'scale-button', { 
                  'pressed': number <= initialResult?.score,
                  'no-pressed': number === initialResult?.score 
                }]"
                @click="setScore(number)">
            {{ number }}
        </button>
    </div>
</template>

<script>
    export default {
        props: {
            initialResult: {
                type: Object
            },
            milestoneCriterion: {
                type: Object,
            },
        },

        methods: {
            setScore(score) {
                this.score = score;
                this.$emit("valueChange", {
                    score: this.score,
                    milestoneCriterionId: this.milestoneCriterion.id
                });
            },

        },

        data() {
            return {
                score: undefined,
            }
        }
    }
</script>

<style scoped>
.buttons-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 15px 0;
}

.button {
    padding: 12px 0;
    border: 2px solid #007bff;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    color: #007bff;
    flex: 1;
    min-width: 50px;
    text-align: center;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    background-color: #f8f9fa;
}

/* Стили для нажатых кнопок шкалы */
.scale-button.pressed {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border-color: #0056b3;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

/* Особый стиль для текущего выбранного значения */
.scale-button.no-pressed {
    background: linear-gradient(135deg, #0056b3, #004085);
    color: white;
    border-color: #004085;
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
    transform: scale(1.05);
}

/* Градиентные цвета для разных значений шкалы */
.scale-button:nth-child(1).pressed { background: linear-gradient(135deg, #dc3545, #c82333); border-color: #c82333; }
.scale-button:nth-child(2).pressed { background: linear-gradient(135deg, #fd7e14, #e55a00); border-color: #e55a00; }
.scale-button:nth-child(3).pressed { background: linear-gradient(135deg, #ffc107, #e0a800); border-color: #e0a800; }
.scale-button:nth-child(4).pressed { background: linear-gradient(135deg, #28a745, #218838); border-color: #218838; }
.scale-button:nth-child(5).pressed { background: linear-gradient(135deg, #20c997, #1ba87e); border-color: #1ba87e; }
.scale-button:nth-child(6).pressed { background: linear-gradient(135deg, #007bff, #0056b3); border-color: #0056b3; }
.scale-button:nth-child(7).pressed { background: linear-gradient(135deg, #6f42c1, #5a2d91); border-color: #5a2d91; }
.scale-button:nth-child(8).pressed { background: linear-gradient(135deg, #e83e8c, #d91a72); border-color: #d91a72; }
.scale-button:nth-child(9).pressed { background: linear-gradient(135deg, #17a2b8, #138496); border-color: #138496; }
.scale-button:nth-child(10).pressed { background: linear-gradient(135deg, #343a40, #23272b); border-color: #23272b; }

/* Анимация нажатия */
.button {
    animation: buttonAppear 0.5s ease-out;
}

@keyframes buttonAppear {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.scale-button.pressed {
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
        gap: 6px;
    }
    
    .button {
        padding: 10px 0;
        font-size: 0.9rem;
        min-width: 40px;
    }
}

@media (max-width: 360px) {
    .buttons-row {
        gap: 4px;
    }
    
    .button {
        padding: 8px 0;
        font-size: 0.8rem;
        min-width: 35px;
    }
}
</style>