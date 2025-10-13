import { api } from './api.js';

export const assessmentApi = {

  getMilestoneCriteriaAssignmentByMilestoneId(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/milestone-criteria-assignment/milestone/' + milestoneId + '/currentUser');
    } catch (error) {
      console.error('Failed to fetch Milestone Criteria Assignment:', error);
      throw error;
    }
  },
}



