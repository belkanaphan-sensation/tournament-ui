import { api } from './api.js';

export const occasionApi = {

  getOccasions() {
    try {
      return api.get('/occasion');
    } catch (error) {
      console.error('Failed to fetch occasions:', error);
      throw error;
    }
  },

//   /**
//    * Получить пользователя по ID
//    * @param {number|string} id - ID пользователя
//    * @returns {Promise<Object>}
//    */
//   async getUserById(id) {
//     try {
//       return await api.get(`/users/${id}`);
//     } catch (error) {
//       console.error(`Failed to fetch user ${id}:`, error);
//       throw error;
//     }
//   },

//   /**
//    * Создать нового пользователя
//    * @param {Object} userData - данные пользователя
//    * @returns {Promise<Object>}
//    */
//   async createUser(userData) {
//     try {
//       return await api.post('/users', userData);
//     } catch (error) {
//       console.error('Failed to create user:', error);
//       throw error;
//     }
//   },

//   /**
//    * Обновить пользователя
//    * @param {number|string} id - ID пользователя
//    * @param {Object} userData - данные для обновления
//    * @returns {Promise<Object>}
//    */
//   async updateUser(id, userData) {
//     try {
//       return await api.put(`/users/${id}`, userData);
//     } catch (error) {
//       console.error(`Failed to update user ${id}:`, error);
//       throw error;
//     }
//   },

//   /**
//    * Удалить пользователя
//    * @param {number|string} id - ID пользователя
//    * @returns {Promise<void>}
//    */
//   async deleteUser(id) {
//     try {
//       return await api.delete(`/users/${id}`);
//     } catch (error) {
//       console.error(`Failed to delete user ${id}:`, error);
//       throw error;
//     }
//   },

//   /**
//    * Поиск пользователей
//    * @param {string} query - поисковый запрос
//    * @returns {Promise<Array>}
//    */
//   async searchUsers(query) {
//     try {
//       return await api.get(`/users/search?q=${encodeURIComponent(query)}`);
//     } catch (error) {
//       console.error('Failed to search users:', error);
//       throw error;
//     }
//   }
};