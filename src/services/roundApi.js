import { api } from './api.js';

export const roundApi = {

  //Получить раунды по milestoneId
  getRounds(id) {
      const milestoneId = Number(id);
      return api.get('/round/milestone/' + milestoneId);
  },

  getRoundDetail(id) {
      const roundId = Number(id);
      return api.get('/round/' + roundId);
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