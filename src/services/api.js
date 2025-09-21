/**
 * Базовый сервис для работы с API
 */
class ApiService {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * Выполняет HTTP запрос
   * @param {string} url - endpoint URL
   * @param {Object} options - опции запроса
   * @returns {Promise<Object>}
   */
  async request(url, options = {}) {
    const fullUrl = `${this.baseURL}${url}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // для куков, если нужно
    };

    try {
      const response = await fetch(fullUrl, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * GET запрос
   * @param {string} url - endpoint URL
   * @param {Object} headers - заголовки
   * @returns {Promise<Object>}
   */
  get(url, headers = {}) {
    return this.request(url, {
      method: 'GET',
      headers,
    });
  }

  /**
   * POST запрос
   * @param {string} url - endpoint URL
   * @param {Object} data - данные для отправки
   * @param {Object} headers - заголовки
   * @returns {Promise<Object>}
   */
  post(url, data, headers = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
  }

  /**
   * PUT запрос
   * @param {string} url - endpoint URL
   * @param {Object} data - данные для обновления
   * @param {Object} headers - заголовки
   * @returns {Promise<Object>}
   */
  put(url, data, headers = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    });
  }

  /**
   * DELETE запрос
   * @param {string} url - endpoint URL
   * @param {Object} headers - заголовки
   * @returns {Promise<Object>}
   */
  delete(url, headers = {}) {
    return this.request(url, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Загрузка файла
   * @param {string} url - endpoint URL
   * @param {FormData} formData - данные формы
   * @returns {Promise<Object>}
   */
  upload(url, formData) {
    return this.request(url, {
      method: 'POST',
      body: formData,
      headers: {
        // Content-Type будет установлен автоматически для FormData
      },
    });
  }
}

// Создаем экземпляр с базовым URL
export const api = new ApiService(import.meta.env.VITE_API_BASE_URL || '/api');