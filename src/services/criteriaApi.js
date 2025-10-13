import { api } from './api.js';

export const criteriaApi = {

  getCriteriaByMilestoneId(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/milestone-criteria-assignment/milestone-rule/' + milestoneId + '/currentUser');
    } catch (error) {
      console.error('Failed to fetch criteria:', error);
      throw error;
    }
  },
}





