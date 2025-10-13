import { api } from './api.js';

export const judgeResultApi = {

  getJudgeRoundResult(id) {
      const roundId = Number(id);
      return api.get('/judge-milestone-result/round/' + roundId + '/currentUser');
  },

  pushRawResult(judgeMilestoneResultRoundRequests) {
    return api.post('/judge-milestone-result/createOrUpdateForRound', judgeMilestoneResultRoundRequests, {
      'Content-Type': 'application/json',
    });
  },

  pushReviewedResult() {

  },
};