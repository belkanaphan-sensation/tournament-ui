<template>
    <div class="scale-criterion">
        <div v-if="forceCriteriaDisplayName && criterionDisplayName" class="criterion-label">
            {{ criterionDisplayName }}
        </div>
        <div
            ref="buttonsRow"
            class="buttons-row"
            :style="rowStyle"
        >
            <button v-for="number in milestoneCriterion.scale" :key="number" :class="['button', 'scale-button', { 
                      'pressed': number <= initialResult?.score,
                      'no-pressed': number === initialResult?.score 
                    }]"
                    :style="getButtonStyle(number)"
                    @click="setScore(number)">
                {{ number }}
            </button>
        </div>
    </div>
</template>

<script>
const RED = { r: 220, g: 53, b: 69 }     // #dc3545
const YELLOW = { r: 255, g: 193, b: 7 }  // #ffc107
const GREEN = { r: 40, g: 167, b: 69 }   // #28a745

function lerp(a, b, t) {
    return Math.round(a + (b - a) * t)
}

function mix(from, to, t) {
    return {
        r: lerp(from.r, to.r, t),
        g: lerp(from.g, to.g, t),
        b: lerp(from.b, to.b, t)
    }
}

function darken(color, amount = 0.12) {
    return {
        r: Math.round(color.r * (1 - amount)),
        g: Math.round(color.g * (1 - amount)),
        b: Math.round(color.b * (1 - amount))
    }
}

function toCss({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`
}

/** t: 0 = red, 0.5 = yellow, 1 = green */
function colorAt(t) {
    const clamped = Math.min(1, Math.max(0, t))
    if (clamped <= 0.5) {
        return mix(RED, YELLOW, clamped / 0.5)
    }
    return mix(YELLOW, GREEN, (clamped - 0.5) / 0.5)
}

/**
 * Подбираем число колонок ≤ maxFit.
 * 1) минимизируем число строк;
 * 2) среди вариантов с тем же числом строк — ровнее хвост;
 * 3) сильно штрафуем хвост из 1–2 кнопок.
 */
function chooseColumns(total, maxFit) {
    const limit = Math.min(total, Math.max(1, maxFit))
    let best = limit
    let bestScore = -Infinity

    for (let columns = limit; columns >= 1; columns -= 1) {
        const rows = Math.ceil(total / columns)
        const lastRow = total - (rows - 1) * columns

        // Главный приоритет — меньше строк (для 9 при maxFit≥5 → 5+4, не 3+3+3)
        let score = -rows * 1000
        score += (lastRow / columns) * 100
        if (lastRow === columns) score += 20

        if (rows > 1 && lastRow === 1) score -= 100
        if (rows > 1 && lastRow === 2) score -= 50

        if (score > bestScore) {
            bestScore = score
            best = columns
        }
    }

    return best
}

function currentMinButtonWidth() {
    if (typeof window === 'undefined') return 50
    if (window.matchMedia('(max-width: 360px)').matches) return 35
    if (window.matchMedia('(max-width: 480px)').matches) return 40
    return 50
}

function currentGap() {
    if (typeof window === 'undefined') return 8
    if (window.matchMedia('(max-width: 360px)').matches) return 4
    if (window.matchMedia('(max-width: 480px)').matches) return 6
    return 8
}

export default {
    props: {
        initialResult: {
            type: Object
        },
        milestoneCriterion: {
            type: Object,
        },
        forceCriteriaDisplayName: {
            type: Boolean,
            default: false,
        },
    },

    computed: {
        criterionDisplayName() {
            return this.milestoneCriterion?.criterion?.value || '';
        },

        scaleTotal() {
            return Number(this.milestoneCriterion?.scale) || 0
        },

        rowStyle() {
            return {
                gap: `${this.rowGapPx}px`
            }
        }
    },

    data() {
        return {
            score: undefined,
            columnsCount: 1,
            rowGapPx: 8,
            resizeObserver: null,
        }
    },

    watch: {
        scaleTotal() {
            this.$nextTick(() => this.updateColumns())
        }
    },

    mounted() {
        this.$nextTick(() => {
            this.updateColumns()
            requestAnimationFrame(() => this.updateColumns())

            if (typeof ResizeObserver !== 'undefined' && this.$refs.buttonsRow) {
                this.resizeObserver = new ResizeObserver(() => this.updateColumns())
                this.resizeObserver.observe(this.$refs.buttonsRow)
            }

            window.addEventListener('resize', this.updateColumns)
        })
    },

    beforeUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
        window.removeEventListener('resize', this.updateColumns)
    },

    methods: {
        setScore(score) {
            this.score = score;
            this.$emit("valueChange", {
                score: this.score,
                milestoneCriterionId: this.milestoneCriterion.id
            });
        },

        updateColumns() {
            const row = this.$refs.buttonsRow
            const total = this.scaleTotal
            if (!row || total <= 0) {
                this.columnsCount = 1
                return
            }

            const gap = currentGap()
            const minWidth = currentMinButtonWidth()
            this.rowGapPx = gap

            const width = row.getBoundingClientRect().width
            if (width < 1) return

            const maxFit = Math.max(1, Math.floor((width + gap) / (minWidth + gap)))
            this.columnsCount = chooseColumns(total, maxFit)
        },

        getButtonStyle(number) {
            const cols = Math.max(1, this.columnsCount)
            const gap = this.rowGapPx
            const basis = `calc((100% - ${(cols - 1) * gap}px) / ${cols})`

            return {
                flex: `1 1 ${basis}`,
                ...this.getPressedStyle(number)
            }
        },

        getPressedStyle(number) {
            const isPressed = number <= this.initialResult?.score
            if (!isPressed) return {}

            const max = this.scaleTotal || 1
            const t = max <= 1 ? 0.5 : (number - 1) / (max - 1)
            const color = colorAt(t)
            const edge = darken(color)
            const isSelected = number === this.initialResult?.score
            const from = toCss(color)
            const to = toCss(edge)

            return {
                background: `linear-gradient(135deg, ${from}, ${to})`,
                borderColor: to,
                color: '#fff',
                boxShadow: isSelected
                    ? `0 6px 20px rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`
                    : `0 4px 15px rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`
            }
        }
    }
}
</script>

<style scoped>
.criterion-label {
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 1.1rem;
}

.buttons-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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
    box-sizing: border-box;
    min-width: 50px;
    text-align: center;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    background-color: #f8f9fa;
}

/* Стили для нажатых кнопок шкалы (цвет задаётся inline по алгоритму) */
.scale-button.pressed {
    color: white;
}

/* Особый стиль для текущего выбранного значения */
.scale-button.no-pressed {
    transform: scale(1.05);
}

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
