import { defineStore } from 'pinia'

export const useJudgeResultStore = defineStore(`judgeResult`, {
    state: () => ({
        results: {}
    }),

    getters: {
        getResult: (state) => (roundId, milestoneCriterionId, participantId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                if (roundResult[milestoneCriterionId]) {
                    let roundCriterionResult = roundResult[milestoneCriterionId];
                    if (roundCriterionResult[participantId]) {
                        return roundCriterionResult[participantId];
                    }
                } 
            }

            return undefined;
        },

        getRoundResultFlat: (state) => (roundId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                let resultArray = [];
                for (let milestoneCriterionId in roundResult) {
                    let participants = roundResult[milestoneCriterionId];
                    for (let participantId in participants) {
                        resultArray.push(participants[participantId])
                    }
                }

                return resultArray;
            }

            return [];
        },

        getAll: (state) => () => {
            return state.results;
        },

        hasResult: (state) => (roundId, milestoneCriterionId, participantId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                if (roundResult[milestoneCriterionId]) {
                    let roundCriterionResult = roundResult[milestoneCriterionId];
                    if (roundCriterionResult[participantId]) {
                        return true;
                    }
                }
            }

            return false;
        }
    },

    actions: {
        setResult(roundId, milestoneCriterionId, participantId, score, id) {
            let roundResult = this.results[roundId];
            if (roundResult) {
                let roundCriterionResult = roundResult[milestoneCriterionId];
                if (roundCriterionResult) {
                    let roundCriterionParticipantResult = roundCriterionResult[participantId];
                    if (roundCriterionParticipantResult) {
                        roundCriterionParticipantResult.score = score;
                    } else {
                        roundCriterionResult[participantId] = {
                            roundId: roundId,
                            milestoneCriterionId: milestoneCriterionId,
                            participantId: participantId,
                            score: score,
                            id: id
                        };
                    }
                } else {
                    roundResult[milestoneCriterionId] = {};
                    roundResult[milestoneCriterionId][participantId] = {
                        roundId: roundId,
                        milestoneCriterionId: milestoneCriterionId,
                        participantId: participantId,
                        score: score,
                        id: id
                    };
                }
            } else {
                this.results[roundId] = {};
                this.results[roundId][milestoneCriterionId] = {};
                this.results[roundId][milestoneCriterionId][participantId] = {
                    roundId: roundId,
                    milestoneCriterionId: milestoneCriterionId,
                    participantId: participantId,
                    score: score,
                    id: id
                };
            }
        },

        clear() {
            this.results = {};
        },

        clearByRoundId(roundId) {
            if (this.results && this.results[roundId]) {
                this.results[roundId] = {};
            }
        },
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'judge-results',
                storage: localStorage
            }
        ]
    }
});