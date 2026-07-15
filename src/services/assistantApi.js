import { api } from './api.js';

export const assistantApi = {
  getAll() {
    return api.get('/assistant');
  },
};
