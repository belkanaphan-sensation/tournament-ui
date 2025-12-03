import { api } from './api.js';

export const activityUserApi = {

  //Получить раунды по milestoneId
  getActivityUserByOccasionIdForCurrentUser(id) {
    const occasionId = Number(id);
    return api.get('/activity-user/occasion/' + occasionId + '/currentUser');
  },

  getActivityUserByActivityId(id) {
    const activityId = Number(id);
    return api.get('/activity-user/activity/' + activityId);
  },
};