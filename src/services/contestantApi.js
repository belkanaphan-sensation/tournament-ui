import { api } from './api.js';

export const contestantApi = {
    getByRoundByRoundIdForCurrentUser(id) {
      const roundId = Number(id);
      return api.get('/contestant/by-round/round/' + roundId + '/currentUser');
    },
    
    getByRoundByRoundId(id) {
      const roundId = Number(id);
      return api.get('/contestant/round/' + roundId);
    }
}