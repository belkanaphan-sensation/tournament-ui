<template>
    <div class="milestone-rules-card" v-if="milestoneRule">
        <div class="rules-header" @click="toggleCollapse">
            <h3 class="rules-title">Правила следующего этапа (Нужно показывать не правила этого этапа, а следующего)</h3>
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
                    <Field label="Лимит конкурсантов" :value="milestoneRule.contestantLimit || 'Не ограничено'"/>
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
        }
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