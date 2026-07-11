import { api } from './api.js';

export const tournamentDisplayApi = {

  updateDisplay(request) {
    return api.post('/display', request, {
      'Content-Type': 'application/json',
    });
  }

};