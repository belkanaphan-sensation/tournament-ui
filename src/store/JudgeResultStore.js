import { defineStore } from 'pinia'

export const useJudgeResultStore = defineStore(`judgeResult`, {
    state: () => ({
        results: {}
    }),

    getters: {
        getResult: (state) => (roundId, milestoneCriterionId, contestantId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                if (roundResult[milestoneCriterionId]) {
                    let roundCriterionResult = roundResult[milestoneCriterionId];
                    if (roundCriterionResult[contestantId]) {
                        return roundCriterionResult[contestantId];
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
                    let contestants = roundResult[milestoneCriterionId];
                    for (let contestantId in contestants) {
                        resultArray.push(contestants[contestantId])
                    }
                }

                return resultArray;
            }

            return [];
        },

        getAll: (state) => () => {
            return state.results;
        },

        hasResult: (state) => (roundId, milestoneCriterionId, contestantId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                if (roundResult[milestoneCriterionId]) {
                    let roundCriterionResult = roundResult[milestoneCriterionId];
                    if (roundCriterionResult[contestantId]) {
                        return true;
                    }
                }
            }

            return false;
        }
    },

    actions: {
        setResult(roundId, milestoneCriterionId, contestantId, score, id) {
            let roundResult = this.results[roundId];
            if (roundResult) {
                let roundCriterionResult = roundResult[milestoneCriterionId];
                if (roundCriterionResult) {
                    let roundCriterionContestantResult = roundCriterionResult[contestantId];
                    if (roundCriterionContestantResult) {
                        roundCriterionContestantResult.score = score;
                    } else {
                        roundCriterionResult[contestantId] = {
                            roundId: roundId,
                            milestoneCriterionId: milestoneCriterionId,
                            contestantId: contestantId,
                            score: score,
                            id: id
                        };
                    }
                } else {
                    roundResult[milestoneCriterionId] = {};
                    roundResult[milestoneCriterionId][contestantId] = {
                        roundId: roundId,
                        milestoneCriterionId: milestoneCriterionId,
                        contestantId: contestantId,
                        score: score,
                        id: id
                    };
                }
            } else {
                this.results[roundId] = {};
                this.results[roundId][milestoneCriterionId] = {};
                this.results[roundId][milestoneCriterionId][contestantId] = {
                    roundId: roundId,
                    milestoneCriterionId: milestoneCriterionId,
                    contestantId: contestantId,
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