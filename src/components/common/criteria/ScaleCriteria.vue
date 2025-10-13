<template>
    <div class="buttons-row">
        <button v-for="number in milestoneCriteria.scale" :key="number" :class="['button', { 
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
            milestoneCriteria: {
                type: Object,
            },
        },

        methods: {
            setScore(score) {
                this.score = score;
                this.$emit("valueChange", {
                    score: this.score,
                    milestoneCriteriaId: this.milestoneCriteria.id
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
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .button {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background-color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .button.pressed {
        background-color: #2aa348;
        color: white;
    }

    .button.no-pressed {
        /* border-color: #0d47a1; */
        transform: scale(1.05);
        /* box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3); */
    }

</style>