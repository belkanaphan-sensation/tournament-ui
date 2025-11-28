import { api } from './api.js';

export const milestoneResultApi = {

  getMilestoneResultsByMilestoneId(id) {
      const milestoneId = Number(id);
      return api.get('/milestone-result/milestone/' + milestoneId );
  },

  updateMilestoneResult(id, updateRequests) {
    const milestoneId = Number(id);
    return api.post('/milestone-result/update/milestone/' + milestoneId, updateRequests, {
      'Content-Type': 'application/json',
    });
  }
}