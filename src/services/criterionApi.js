import { api } from './api.js';

export const criterionApi = {

  getCriterionByMilestoneId(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/milestone-criterion/milestone/' + milestoneId + '/currentUser');
    } catch (error) {
      console.error('Failed to fetch criterion:', error);
      throw error;
    }
  },
}





