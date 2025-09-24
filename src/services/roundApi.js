import { api } from './api.js';

export const roundApi = {

  //Получить раунды по milestoneId
  getRounds(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/round/milestone/' + milestoneId);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  },

  getByMilestoneIdInLifeStates(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/round/milestone/' + milestoneId + '/life');
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  },
};