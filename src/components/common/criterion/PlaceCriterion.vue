<template>
    <div
        ref="buttonsRow"
        class="buttons-row"
        :style="rowStyle"
    >
        <button v-for="number in maxPlace" :key="number" :class="['button', 'place-button', { 
                  'pressed': number === initialResult?.score,
                  'no-pressed': number === initialResult?.score 
                }]"
                :style="getButtonStyle(number)"
                @click="setScore(number)">
            <span class="place-content">
                <span v-if="medalIcon(number)" class="medal-icon" aria-hidden="true">{{ medalIcon(number) }}</span>
                <span class="place-number">{{ number }}</span>
            </span>
        </button>
    </div>
</template>

<script>
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
    name: 'PlaceCriterion',

    props: {
        initialResult: {
            type: Object
        },
        milestoneCriterion: {
            type: Object,
        },
        maxPlace: {
            type: Number
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

    computed: {
        maxPlace() {
            return this.maxPlace || 0
        },

        rowStyle() {
            return {
                gap: `${this.rowGapPx}px`
            }
        }
    },

    watch: {
        maxPlace() {
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
        medalIcon(number) {
            if (number === 1) return '🥇'
            if (number === 2) return '🥈'
            if (number === 3) return '🥉'
            return ''
        },

        setScore(score) {
            this.score = score;
            this.$emit("valueChange", {
                score: this.score,
                milestoneCriterionId: this.milestoneCriterion.id
            });
        },

        updateColumns() {
            const row = this.$refs.buttonsRow
            const total = this.maxPlace
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
                flex: `1 1 ${basis}`
            }
        }
    }
}
</script>

<style scoped>
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

.place-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.medal-icon {
    font-size: 1.05em;
    line-height: 1;
}

.place-number {
    line-height: 1;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    background-color: #f8f9fa;
}

.place-button.pressed,
.place-button.pressed:hover {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border-color: #0056b3;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.place-button.no-pressed,
.place-button.no-pressed:hover {
    background: linear-gradient(135deg, #0056b3, #004085);
    color: white;
    border-color: #004085;
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
    transform: scale(1.05);
}

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

.place-button.pressed {
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
