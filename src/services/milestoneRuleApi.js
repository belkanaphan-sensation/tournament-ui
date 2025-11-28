import { api } from './api.js';

export const milestoneRuleApi = {

  getMilestoneRuleByMilestoneId(id) {
      const milestoneId = Number(id);
      return api.get('/milestone-rule/milestone/' + milestoneId);
  },

  getNextMilestoneRuleByMilestoneId(id) {
      const milestoneId = Number(id);
      return api.get('/milestone-rule/next/milestone/' + milestoneId);
  },
};


