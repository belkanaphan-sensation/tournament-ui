import { api } from './api.js';

export const assessmentApi = {

  getMilestoneCriterionAssignmentByMilestoneId(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/milestone-criterion-assignment/milestone/' + milestoneId + '/currentUser');
    } catch (error) {
      console.error('Failed to fetch Milestone Criterion Assignment:', error);
      throw error;
    }
  },
}