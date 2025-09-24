import { api } from './api.js';

export const userApi = {

  //Получить текущего пользователя
  getCurrentUser() {
    try {
      return api.get('/user/currentUser');
    } catch (error) {
      console.error('Failed to fetch currentUser:', error);
      throw error;
    }
  },
};