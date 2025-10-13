import { api } from './api.js';

export const roundResultStatusApi = {

  getRoundResultStatus(id) {
      const roundId = Number(id);
      return api.get('/judge-round-status/round/' + roundId + '/currentUser');
  },

  getRoundResultStatusByMilestoneId(id) {
      const milestoneId = Number(id);
      return api.get('/judge-round-status/milestone/' + milestoneId + '/currentUser');
  },
};






  

  