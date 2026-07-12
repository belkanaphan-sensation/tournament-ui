import { api } from './api.js';

export const tournamentDisplayApi = {

  getDisplayRounds() {
    return api.get('/display');
  },

  getPrimaryDisplayConfig() {
    return api.get('/display/config');
  },

  updateDisplay(request) {
    return api.post('/display', request, {
      'Content-Type': 'application/json',
    });
  }

};
