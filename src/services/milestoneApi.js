import { api } from './api.js';

export const milestoneApi = {

  //Получить активности по activityId
  async getMilestones(id) {
    try {
      const activityId = Number(id);
      return await api.get('/v1/milestone/activity/' + activityId);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  },
};