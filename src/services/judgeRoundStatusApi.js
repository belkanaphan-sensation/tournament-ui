import { api } from './api.js';

export const judgeRoundStatusApi = {

  getJudgeRoundResult(id) {
      const roundId = Number(id);
      return api.post('/judge-round-status/not-ready?roundId=' + roundId);
  },
};