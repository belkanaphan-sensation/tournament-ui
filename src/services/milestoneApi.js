import { api } from './api.js';

export const milestoneApi = {

  //Получить активности по activityId
  getMilestones(id) {
      const activityId = Number(id);
      return api.get('/milestone/activity/' + activityId);
  },

  planMilestone(id) {
      const miletoneId = Number(id);
      return api.post('/milestone/plan/' + miletoneId);
  },

  backToDraft(id) {
      const miletoneId = Number(id);
      return api.post('/milestone/draft/' + miletoneId);
  },

  prepareRounds(id) {
      const miletoneId = Number(id);
      return api.post('/milestone/prepare-rounds/' + miletoneId, {}, {
      'Content-Type': 'application/json',
    });
  },

  startMilestone(id) {
      const miletoneId = Number(id);
      return api.post('/milestone/start/' + miletoneId);
  },

  sumUpMilestone(id) {
      const miletoneId = Number(id);
      return api.post('/milestone/sum-up/' + miletoneId);
  },

  completeMilestone(id) {
      const miletoneId = Number(id);
      return api.post('/milestone/complete/' + miletoneId, {}, {
      'Content-Type': 'application/json',
    });
  },

  getMilestoneDetail(id) {
      const milestoneId = Number(id);
      return api.get('/milestone/' + milestoneId);
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