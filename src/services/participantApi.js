import { api } from './api.js';

export const participantApi = {

  getParticipantsByRoundId(id) {
    try {
      const roundId = Number(id);
      return api.get('/participant/by-round/round/' + roundId + '/currentUser');
    } catch (error) {
      console.error('Failed to fetch participants: ', error);
      throw error;
    }
  },
}

