import { defineStore } from 'pinia'

export const useJudgeResultStore = defineStore(`judgeResult`, {
    state: () => ({
        results: {}
    }),

    getters: {
        getResult: (state) => (roundId, milestoneCriteriaId, participantId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                if (roundResult[milestoneCriteriaId]) {
                    let roundCriteriaResult = roundResult[milestoneCriteriaId];
                    if (roundCriteriaResult[participantId]) {
                        return roundCriteriaResult[participantId];
                    }
                } 
            }

            return undefined;
        },

        getRoundResultFlat: (state) => (roundId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                let resultArray = [];
                for (let milestoneCriteriaId in roundResult) {
                    let participants = roundResult[milestoneCriteriaId];
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

        hasResult: (state) => (roundId, milestoneCriteriaId, participantId) => {
            if (state.results[roundId]) {
                let roundResult = state.results[roundId];
                if (roundResult[milestoneCriteriaId]) {
                    let roundCriteriaResult = roundResult[milestoneCriteriaId];
                    if (roundCriteriaResult[participantId]) {
                        return true;
                    }
                }
            }

            return false;
        }
    },

    actions: {
        setResult(roundId, milestoneCriteriaId, participantId, score, isCandidate, id) {
            let roundResult = this.results[roundId];
            if (roundResult) {
                let roundCriteriaResult = roundResult[milestoneCriteriaId];
                if (roundCriteriaResult) {
                    let roundCriteriaParticipantResult = roundCriteriaResult[participantId];
                    if (roundCriteriaParticipantResult) {
                        roundCriteriaParticipantResult.score = score;
                        roundCriteriaParticipantResult.isCandidate = isCandidate;
                    } else {
                        roundCriteriaResult[participantId] = {
                            roundId: roundId,
                            milestoneCriteriaId: milestoneCriteriaId,
                            participantId: participantId,
                            score: score,
                            isCandidate: isCandidate,
                            id: id
                        };
                    }
                } else {
                    roundResult[milestoneCriteriaId] = {};
                    roundResult[milestoneCriteriaId][participantId] = {
                        roundId: roundId,
                        milestoneCriteriaId: milestoneCriteriaId,
                        participantId: participantId,
                        score: score,
                        isCandidate: isCandidate,
                        id: id
                    };
                }
            } else {
                this.results[roundId] = {};
                this.results[roundId][milestoneCriteriaId] = {};
                this.results[roundId][milestoneCriteriaId][participantId] = {
                    roundId: roundId,
                    milestoneCriteriaId: milestoneCriteriaId,
                    participantId: participantId,
                    score: score,
                    isCandidate: isCandidate,
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