<template>
    <div class="participant-card">
        <div class="card-header" @click="toogleCollapse()">
            <div class="participant-card-header">
                <div>
                    <h3>№ {{ participantNumber }}</h3>
                </div>

                <span v-if="isMultiCriterion()" class="collapse-icon"> {{ isCollapsed ? '▶' : '▼' }} </span>
            </div>
        </div>
        
        <div v-if="isOneCriterion()">
            <div v-if="criterion[0].scale == 1">
                <PassCriterion 
                    @valueChange="handleCriterionValueChange"
                    :milestoneCriterionId="criterion[0].id"
                    :initialResult="resultStore.getResult(roundId, criterion[0].id, participantId)"/>
            </div>
            <div v-if="criterion[0].scale > 1">
                <ScaleCriterion 
                    @valueChange="handleCriterionValueChange"
                    :milestoneCriterion="criterion[0]" 
                    :initialResult="resultStore.getResult(roundId, criterion[0].id, participantId)"/>
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
                            :initialResult="resultStore.getResult(roundId, currentCriterion.id, participantId)"/>
                    </div>
                    <div v-if="currentCriterion.scale > 1">
                        <ScaleCriterion 
                            @valueChange="handleCriterionValueChange"
                            :milestoneCriterion="currentCriterion" 
                            :initialResult="resultStore.getResult(roundId, currentCriterion.id, participantId)"/>
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
        participantId: {
            type: Number,
        },
        participantNumber: {
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
            this.resultStore.setResult(this.roundId, data.milestoneCriterionId, this.participantId, data.score);
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
.participant-card {
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

/* .participant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #007bff;
} */

.card-header {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 2px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

/* .card-header:hover {
    background-color: #f8f9fa;
    border-radius: 6px;
    margin: -5px;
    padding: 5px;
    padding-bottom: 15px;
} */

.participant-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.participant-card-header h3 {
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

/* .participant-card {
    animation: cardAppear 0.5s ease-out;
} */

/* @keyframes cardAppear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
} */

/* @media (max-width: 480px) {
    .participant-card {
        padding: 15px;
    }
    
    .participant-card-header h3 {
        font-size: 1.3rem;
    }
    
    .criterion-label {
        font-size: 1rem;
    }
} */
</style>