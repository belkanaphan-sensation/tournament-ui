<template>
    <div class="contestant-card">
        <div class="card-header" @click="toogleCollapse()">
            <div class="contestant-card-header">
                <div>
                    <h3>№ {{ contestantNumber }}</h3>
                </div>

                <span v-if="isMultiCriterion()" class="collapse-icon"> {{ isCollapsed ? '▶' : '▼' }} </span>
            </div>
        </div>
        
        <div v-if="isOneCriterion()">
            <div v-if="criterion[0].scale == 1">
                <PassCriterion 
                    @valueChange="handleCriterionValueChange"
                    :milestoneCriterionId="criterion[0].id"
                    :initialResult="resultStore.getResult(roundId, criterion[0].id, contestantId)"/>
            </div>
            <div v-if="criterion[0].scale > 1">
                <ScaleCriterion 
                    @valueChange="handleCriterionValueChange"
                    :milestoneCriterion="criterion[0]" 
                    :initialResult="resultStore.getResult(roundId, criterion[0].id, contestantId)"/>
            </div>
        </div>

        <div v-if="!isCollapsed">
            <div v-if="isMultiCriterion()">
                <div v-for="currentCriterion in criterion" :key="currentCriterion">
                    <div class="criterion-label">
                        {{ currentCriterion.criterion.value }}
                    </div>

                    <div v-if="currentCriterion.scale == 1">
                        <PassCriterion 
                            @valueChange="handleCriterionValueChange"
                            :milestoneCriterionId="criterion[0].id"
                            :initialResult="resultStore.getResult(roundId, currentCriterion.id, contestantId)"/>
                    </div>
                    <div v-if="currentCriterion.scale > 1">
                        <ScaleCriterion 
                            @valueChange="handleCriterionValueChange"
                            :milestoneCriterion="currentCriterion" 
                            :initialResult="resultStore.getResult(roundId, currentCriterion.id, contestantId)"/>
                    </div>
                </div>
            </div>
        </div>
    </div> 
</template>

<script>

import '../../assets/likeButton.css'
import PassCriterion from '../common/criterion/PassCriterion.vue';
import ScaleCriterion from '../common/criterion/ScaleCriterion.vue';
import Mask from '../common/Mask.vue';
import { useJudgeResultStore } from '../../store/JudgeResultStore.js';

export default {
    components: {
        PassCriterion,
        ScaleCriterion,
        Mask
    },

    props: {
        contestantId: {
            type: Number,
        },
        contestantNumber: {
            type: String,
        },
        criterion: {
            type: Array,
        },
        roundId: {
            type: Number,
        }
    },

    data() {
        return {
            isCollapsed: true
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
        // this.isCollapsed = this.isMultiCriterion();
        // this.isCollapsed = false;
    },

    methods: {
        toogleCollapse() {
            if (this.isMultiCriterion()) {
                this.isCollapsed = !this.isCollapsed;
            }
        },

        isOneCriterion() {
            return this.criterion.length === 1;
        },

        isMultiCriterion() {
            return this.criterion.length > 1;
        },

        handleCriterionValueChange(data) {
            this.resultStore.setResult(this.roundId, data.milestoneCriterionId, this.contestantId, data.score);
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
.contestant-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 20px;
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-header {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.contestant-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.contestant-card-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    font-weight: 600;
}

.collapse-icon {
    font-size: 1.2rem;
    color: #666;
    transition: transform 0.3s ease;
}

.criterion-label {
    font-weight: 600;
    color: #333;
    margin: 15px 0 10px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 1.1rem;
}
</style>