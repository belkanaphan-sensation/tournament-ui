import { api } from './api.js';

export const judgeRoundStatusApi = {

  getJudgeRoundResult(id) {
      const roundId = Number(id);
      return api.post('/judge-round-status/not-ready?roundId=' + roundId);
  },

  getRoundJudges(id) {
      const roundId = Number(id);
      return api.get('/judge-round-status/round/{roundId}' + roundId);
  }
};