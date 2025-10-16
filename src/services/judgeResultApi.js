import { api } from './api.js';

export const judgeResultApi = {

  getJudgeRoundResult(id) {
      const roundId = Number(id);
      return api.get('/judge-milestone-result/round/' + roundId + '/currentUser');
  },

  pushRawResult(id, judgeMilestoneResultRoundRequests) {
    const roundId = Number(id);
    return api.post('/judge-milestone-result/createOrUpdateForRound/' + roundId, judgeMilestoneResultRoundRequests, {
      'Content-Type': 'application/json',
    });
  },
};