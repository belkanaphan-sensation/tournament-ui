import { api } from './api.js';

export const assignmentApi = {

  getAssignmentByOccasionIdForCurrentUser(id) {
    try {
      const occasionId = Number(id);
      return api.get('/user-activity-assignment/occasion/' + occasionId + '/currentUser');
    } catch (error) {
      console.error('Failed to fetch activity assessments:', error);
      throw error;
    }
  },
}