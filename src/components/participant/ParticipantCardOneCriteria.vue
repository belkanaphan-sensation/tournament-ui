<template>
    <div class="card card-transparent">
        <div class="card-header">
            <div class="participant-card-header">
                <div>
                    <h3> № {{ participant.number }} </h3>
                </div>
                <div class="like-button-container">
                    <button 
                        class="star-button"
                        :class="{ 'starred': isLiked }"
                        @click="toggleLike"
                        aria-label="Добавить в избранное"
                    >
                        <svg class="star-icon" width="24" height="24" viewBox="0 0 24 24">
                        <path 
                            :fill="isLiked ? '#ffcc00' : 'none'"
                            stroke="#ffcc00"
                            stroke-width="1.5"
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="buttons-row">
            <button v-for="number in criteria.scale" :key="number" :class="['rating-button', { 
                  'active': number <= this.roundResult.score,
                  'selected': number === this.roundResult.score 
                }]"
                @click="setScore(number)">

              {{ number }}
            </button>
          </div>
        </div>
    </div> 
</template>

<script>

import '../../assets/likeButton.css'
import Mask from '../common/Mask.vue';

export default {

    props: {
        participant: {
            type: Object,
        },
        criteria: {
            type: Object,
        },
        roundResult: {
            type: Object,
        }
    },

    async mounted() {
        
    },

    methods: {
        setScore(number) {
            this.roundResult.score = number;
        },

        toggleLike() {
            if (this.isLiked) {
                this.likeCount--
            } else {
                this.likeCount++
            }
            this.isLiked = !this.isLiked
            this.$emit('like-changed', {
                isLiked: this.isLiked,
                count: this.likeCount
            })
        }
    },

    data() {
        return {
            // score: 0
            isLiked: 0
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

    .rating-button {
        width: 36px;
        height: 36px;
        /* border: 2px solid #2196f3; */
        border-radius: 8px;
        background-color: white;
        /* color: #2196f3; */
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .rating-button.active {
        background-color: #2aa348;
        color: white;
        /* border-color: #1976d2; */
    }

    .rating-button.selected {
        /* background-color: #1976d2; */
        border-color: #0d47a1;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    }
</style>
