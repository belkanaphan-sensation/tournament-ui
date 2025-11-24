import { api } from './api.js';

export const contestantApi = {
    getContestantsByRoundId(id) {
      const roundId = Number(id);
      return api.get('/contestant/by-round/round/' + roundId + '/currentUser');
    }
}