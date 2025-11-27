import { api } from './api.js';

export const milestoneResultApi = {

  getMilestoneResultsByMilestoneId(id) {
      const milestoneId = Number(id);
      return api.get('/milestone-result/milestone/' + milestoneId );
  },
}