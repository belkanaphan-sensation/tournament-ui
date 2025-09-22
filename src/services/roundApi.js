import { api } from './api.js';

export const roundApi = {

  //Получить раунды по milestoneId
  async getRounds(id) {
    try {
      const milestoneId = Number(id);
      return await api.get('/v1/round/milestone/' + milestoneId);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      throw error;
    }
  },
};