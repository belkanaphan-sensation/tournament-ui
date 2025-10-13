<template>
    <div class="buttons-row">
        <button @click="setScore(1)" :class="['button', 'pass-button', { 
                  'pressed': 1 === this?.initialResult?.score || undefined,
                  'no-pressed': 0 === this?.initialResult?.score ||  undefined
                }]"> Да
        </button>

        <button @click="setScore(0)" :class="['button', 'no-pass-button', { 
                  'pressed': 0 === this?.initialResult?.score || undefined,
                  'no-pressed': 1 === this?.initialResult?.score || undefined,
                }]"> Нет
        </button>

        <button @click="setIsCandidate()" :class="['button', 'candidate-button', { 
                  'pressed': this?.initialResult?.isCandidate || undefined,
                  'no-pressed': !this?.initialResult?.isCandidate || undefined
                }]"> Возможно
        </button>
        
    </div>

    <!-- <div class="test-message ">
            <h4> Score: {{ score }} </h4>
            <h4> isLiked: {{ isLiked }} </h4>
        </div> -->
</template>

<script>

    export default {
        props: {
            initialResult: {
                type: Object
            },
            milestoneCriteriaId: {
                type: Number
            }
        },

        methods: {
            setScore(score) {
                this.isCandidate= undefined;
                this.score = score;
                this.$emit("valueChange", {
                    score: this.score,
                    isCandidate: this.isCandidate,
                    milestoneCriteriaId: this.milestoneCriteriaId
                });
            },

            setIsCandidate() {
                this.isCandidate= true;
                this.score = undefined;
                this.$emit("valueChange", {
                    score: this.score,
                    isCandidate: this.isCandidate,
                    milestoneCriteriaId: this.milestoneCriteriaId
                });
            }
        },

        data() {
            return {
                // score: this.initialResult.score,
                // isCandidate: this.initialResult.isCandidate,
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
        width: 85px;
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

    .pass-button {

    }

    .no-pass-button {

    }

    .like-button {

    }

    .pass-button.pressed {
        background-color: #2aa348;
        color: white;
    }

    .pass-button.no-pressed {
        /* border-color: #0d47a1; */
        transform: scale(1.05);
        /* box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3); */
    }

    .no-pass-button.pressed {
        background-color: rgb(254, 0, 0);
        color: white;
    }

    .no-pass-button.no-pressed {
        /* border-color: #0d47a1; */
        transform: scale(1.05);
        /* box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3); */
    }

    .candidate-button.pressed {
        background-color: #2a72a3;
        color: white;
    }

    .candidate.no-pressed {
        /* border-color: #0d47a1; */
        transform: scale(1.05);
        /* box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3); */
    }

    .test-message {
        height: 30px;
        width: 100px;
        display: flex;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
    }

</style>