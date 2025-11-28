<template>
    <div class="milestone-rules-card" v-if="milestoneRule">
        <div class="rules-header" @click="toggleCollapse">
            <h3 class="rules-title">Правила следующего этапа</h3>
            <button class="collapse-btn" :class="{ 'collapsed': isCollapsed }">
                <span class="collapse-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
            </button>
        </div>
        
        <div class="rules-content" v-show="!isCollapsed">
            <div class="rules-grid">
                <div class="rule-item">
                    <Field label="Тип конкурсантов" :value="getContestantTypeLabel(milestoneRule.contestantType)"/>
                </div>
                <div class="rule-item">
                    <Field label="Режим оценивания" :value="getAssessmentModeLabel(milestoneRule.assessmentMode)"/>
                </div>
                <div class="rule-item">
                    <Field 
                        label="Лимит конкурсантов" 
                        :value="getContestantLimitDisplayValue()"
                    />
                </div>
                <div class="rule-item">
                    <Field label="Строгий режим отбора" :value="milestoneRule.strictPassMode ? 'Да' : 'Нет'"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Field from '../common/Field.vue';

export default {
    name: 'MilestoneRulesCard',

    components: {
        Field,
    },

    props: {
        milestoneRule: {
            type: Object,
            default: null
        },
        passedContestantsCounts: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            isCollapsed: false
        }
    },

    methods: {
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
        },

        getContestantTypeLabel(type) {
            const labels = {
                'SINGLE': 'Одиночные',
                'COUPLE_TRANSIENT': 'Пары (временные)',
                'COUPLE_PERSISTENT': 'Пары (постоянные)'
            };
            return labels[type] || type;
        },
        
        getAssessmentModeLabel(mode) {
            const labels = {
                'PASS': 'Прохождение',
                // добавьте другие режимы оценивания по мере необходимости
            };
            return labels[mode] || mode;
        },

        // Получаем отображаемое значение для лимита конкурсантов
        getContestantLimitDisplayValue() {
            const limit = this.milestoneRule.contestantLimit;
            if (!limit) return 'Не ограничено';
            
            if (this.milestoneRule.contestantType === 'SINGLE') {
                // Для одиночных показываем два значения через слэш
                if (this.passedContestantsCounts.length === 2) {
                    return `${this.passedContestantsCounts[0]} / ${this.passedContestantsCounts[1]} / ${limit}`;
                }
            } else {
                // Для пар показываем одно значение
                if (this.passedContestantsCounts.length === 1) {
                    return `${this.passedContestantsCounts[0]} / ${limit}`;
                }
            }
            
            return `${this.passedContestantsCounts.join(' / ')} / ${limit}`;
        },
    }
}
</script>

<style scoped>
.milestone-rules-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.rules-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    margin-bottom: 15px;
}

.rules-title {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
    font-weight: 600;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
    flex: 1;
}

.collapse-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    margin-left: 10px;
    transition: transform 0.3s ease;
}

.collapse-btn.collapsed {
    transform: rotate(-90deg);
}

.collapse-icon {
    font-size: 1rem;
    color: #666;
    display: block;
    transition: transform 0.3s ease;
}

.rules-content {
    transition: all 0.3s ease;
}

.rules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.rule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f5f5f5;
}

/* Стили для подсветки лимита */
.limit-exceeded {
    color: #dc3545;
    font-weight: bold;
    background-color: #f8d7da;
    padding: 4px 8px;
    border-radius: 4px;
}

.limit-reached {
    color: #28a745;
    font-weight: bold;
    background-color: #d4edda;
    padding: 4px 8px;
    border-radius: 4px;
}

.limit-available {
    color: #ffc107;
    font-weight: bold;
    background-color: #fff3cd;
    padding: 4px 8px;
    border-radius: 4px;
}

/* Анимация для плавного сворачивания */
.rules-content {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
}

/* Адаптивность */
@media (max-width: 768px) {
    .rules-grid {
        grid-template-columns: 1fr;
    }
    
    .rule-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .rules-header {
        align-items: flex-start;
    }
    
    .rules-title {
        font-size: 1.1rem;
    }
}
</style>