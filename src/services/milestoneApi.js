import { api } from './api.js';

export const milestoneApi = {

  //Получить активности по activityId
  getMilestones(id) {
    try {
      const activityId = Number(id);
      return api.get('/milestone/activity/' + activityId);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  },

  getByActivityIdInLifeStates(id) {
    try {
      const activityId = Number(id);
      return api.get('/milestone/activity/' + activityId + '/life');
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  },


};