import { api } from './api.js';

export const participantApi = {

  getParticipantsByRoundId(id) {
      const roundId = Number(id);
      return api.get('/participant/by-round/round/' + roundId + '/currentUser');
  },

  getParticipantsByActivity(id) {
      const activityId = Number(id);
      return api.get('/participant/activity/' + activityId);
  },

  registerParticipant(id, number) {
      const participantId = Number(id);
      return api.post('/participant/' + participantId + '/register/' + number);
  },

  unregisterParticipants(id) {
      const participantId = Number(id);
      return api.post('/participant/' + participantId + '/unregister');
  }
}

