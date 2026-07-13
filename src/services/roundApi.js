import { api } from './api.js';

export const roundApi = {

    //Получить раунды по milestoneId
    getRounds(id) {
        const milestoneId = Number(id);
        return api.get('/round/milestone/' + milestoneId);
    },

    getRoundDetail(id) {
        const roundId = Number(id);
        return api.get('/round/' + roundId);
    },

    getByMilestoneIdInLifeStates(id) {
        const milestoneId = Number(id);
        return api.get('/round/milestone/' + milestoneId + '/life');
    },

    createExtraRound(createRoundRequest) {
        return api.post('/round', createRoundRequest, {
            'Content-Type': 'application/json',
        });
    },

    searchRounds(request) {
        return api.post('/round/search', request, {
            'Content-Type': 'application/json',
        });
    },

    addContestant(roundId, participantIds) {
        return api.post(
            `/round/${roundId}/contestant/add`,
            participantIds,
            { 'Content-Type': 'application/json' }
        );
    },

    removeContestant(roundId, contestantId) {
        return api.post(
            `/round/${roundId}/contestant/${contestantId}/remove`,
            {},
            { 'Content-Type': 'application/json' }
        );
    },

    moveContestant(sourceRoundId, contestantId, targetRoundId) {
        return api.post(
            `/round/${sourceRoundId}/contestant/${contestantId}/move/${targetRoundId}`,
            {},
            { 'Content-Type': 'application/json' }
        );
    }
};