<template>
    <div class="card card-transparent">
        <div class="card-header" @click="toogleCollapse()">
            <div class="participant-card-header">
                <div>
                    <h3> № {{ participantNumber }} </h3>
                </div>

                <span v-if="isMultiCriteria()" class="collapse-icon"> {{ isCollapsed ? '▶' : '▼' }} </span>
            </div>
        </div>

        <div v-if="!isCollapsed">
            <div v-if="isOneCriteria()">
                <div v-if="criteria[0].scale == 1">
                    <PassCriteria 
                        @valueChange="handleCriteriaValueChange"
                        :milestoneCriteriaId="criteria[0].criteria.id"
                        :initialResult="resultStore.getResult(roundId, criteria[0].id, participantId)"/>
                </div>
                <div v-if="criteria[0].scale > 1">
                    <ScaleCriteria 
                        @valueChange="handleCriteriaValueChange"
                        :milestoneCriteria="criteria[0]" 
                        :initialResult="resultStore.getResult(roundId, criteria[0].id, participantId)"/>
                </div>
            </div>

            <div v-if="isMultiCriteria()">
                <div v-for="currentCriteria in criteria" :key="currentCriteria">
                    <div class="criteria-label">
                        {{ currentCriteria.criteria.value }}
                    </div>

                    <div v-if="currentCriteria.scale == 1">
                        <PassCriteria 
                            @valueChange="handleCriteriaValueChange"
                            :milestoneCriteriaId="criteria[0].criteria.id"
                            :initialResult="resultStore.getResult(roundId, currentCriteria.id, participantId)"/>
                    </div>
                    <div v-if="currentCriteria.scale > 1">
                        <ScaleCriteria 
                            @valueChange="handleCriteriaValueChange"
                            :milestoneCriteria="currentCriteria" 
                            :initialResult="resultStore.getResult(roundId, currentCriteria.id, participantId)"/>
                    </div>
                </div>
            </div>
        </div>
    </div> 
</template>

<script>

import '../../assets/likeButton.css'
import PassCriteria from '../common/criteria/PassCriteria.vue';
import ScaleCriteria from '../common/criteria/ScaleCriteria.vue';
import Mask from '../common/Mask.vue';
import { useJudgeResultStore } from '../../store/JudgeResultStore.js';

export default {
    components: {
        PassCriteria,
        ScaleCriteria,
        Mask
    },

    props: {
        participantId: {
            type: Number,
        },
        participantNumber: {
            type: String,
        },
        criteria: {
            type: Array,
        },
        roundId: {
            type: Number,
        }
    },

    setup(props) {
        const resultStore = useJudgeResultStore();
        return {
            resultStore
        }
    },

    async mounted() {
        // this.resultStore = useJudgeResultStore();
        this.isCollapsed = this.isMultiCriteria();
    },

    methods: {
        setScore(number) {
            // this.roundResult.score = number;
        },

        toogleCollapse() {
            if (this.isMultiCriteria()) {
                this.isCollapsed = !this.isCollapsed;
            }
        },

        isOneCriteria() {
            return this.criteria.length === 1;
        },

        isMultiCriteria() {
            return this.criteria.length > 1;
        },

        handleCriteriaValueChange(data) {
            this.resultStore.setResult(this.roundId, data.milestoneCriteriaId, this.participantId, data.score, data.isCandidate);
        }
    },

    data() {
        return {
            isCollapsed: true,
        }
    }
}
</script>

<style scoped>
    .participant-card-header {
        display: flex;
        justify-content: space-between;
    }

    .card-transparent {
        -webkit-tap-highlight-color: transparent;
    }

    .buttons-row {
        display: flex;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .criteria-label {
        font-size: 16px;
        font-weight: 600;
        font-weight: bold;
        color: #2c3e50;
        text-align: center;
        margin-bottom: 6px;
        margin-top: 6px;
    }
</style>
