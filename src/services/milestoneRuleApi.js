import { api } from './api.js';

export const milestoneRuleApi = {

  getMilestoneRuleByMilestoneId(id) {
    try {
      const milestoneId = Number(id);
      return api.get('/milestone-rule/milestone/' + milestoneId);
    } catch (error) {
      console.error('Failed to fetch milestoneRule:', error);
      throw error;
    }
  },
};


