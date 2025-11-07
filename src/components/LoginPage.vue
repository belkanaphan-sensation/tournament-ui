<template>
  <form @submit.prevent="handleLogin" class="login-form">
    <div class="form-group">
      <label for="username">Имя пользователя</label>
      <input 
        v-model="username"
        id="username"
        type="text"
        required
        :disabled="loading"
        placeholder="Введите имя пользователя"
      >
    </div>
    
    <div class="form-group">
      <label for="password">Пароль</label>
      <input 
        v-model="password"
        id="password"
        type="password"
        required
        :disabled="loading"
        placeholder="Введите пароль"
      >
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" :disabled="loading" class="submit-button">
      {{ loading ? 'Вход...' : 'Войти' }}
    </button>
  </form>
</template>

<script setup>
    import { ref } from 'vue'
    import { authApi } from '@/services/authApi.js';
    import { userApi } from '@/services/userApi.js';
    import { useRouter } from 'vue-router';
    import { useJudgeResultStore } from '../store/JudgeResultStore.js';

    const username = ref('')
    const password = ref('')
    const loading = ref(false)
    const error = ref('')

    const router = useRouter();

    const handleLogin = async () => {
        try {
            const formData = new FormData()
            formData.append('username', username.value)
            formData.append('password', password.value)

            const response = await authApi.login(formData)
            
            if (response.status === 401) {
                error.value = 'Неверный логин или пароль'
            } else if (!response.ok) {
            // Попробуем получить текст ошибки от сервера
              try {
                  const errorData = await response.text()
                  error.value = errorData || `Ошибка сервера: ${response.status}`
              } catch {
                  error.value = `Ошибка сервера: ${response.status}`
              }
            } else {
                console.log('Login successful!');
                localStorage.setItem('userInfo', JSON.stringify(await userApi.getCurrentUser()));
                // JSON.parse(localStorage.getItem('userInfo'))
                router.push('/');
            }

            const resultStore = useJudgeResultStore();
            resultStore.clear();

        } catch (err) {
            // Обработка сетевых ошибок или других исключений
            error.value = 'Ошибка сети. Проверьте подключение к интернету.'
            console.error('Login error:', err)
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
.login-form {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 40px;
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.login-form:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fafafa;
  color: #333;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  transform: translateY(-2px);
}

.form-group input:hover {
  border-color: #b0b0b0;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-group input::placeholder {
  color: #999;
  font-size: 0.9rem;
}

/* Анимация для label при фокусе */
.form-group:focus-within label {
  color: #007bff;
}

.submit-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
  background: linear-gradient(135deg, #0056b3, #004085);
}

.submit-button:active:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.submit-button:disabled {
  background: linear-gradient(135deg, #6c757d, #545b62);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.2);
  opacity: 0.7;
}

.error-message {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  animation: errorAppear 0.4s ease-out;
}

@keyframes errorAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Анимация появления формы */
.login-form {
  animation: formAppear 0.6s ease-out;
}

@keyframes formAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Адаптивность */
@media (max-width: 480px) {
  .login-form {
    padding: 30px 25px;
    margin: 20px;
    border-radius: 12px;
  }
  
  .form-group input {
    padding: 12px 14px;
    font-size: 0.95rem;
  }
  
  .submit-button {
    padding: 14px;
    font-size: 1rem;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
}

@media (max-width: 360px) {
  .login-form {
    padding: 25px 20px;
    margin: 15px;
  }
  
  .form-group input {
    padding: 10px 12px;
  }
  
  .submit-button {
    padding: 12px;
  }
}

/* Дополнительные эффекты для улучшения UX */
.form-group input:valid {
  border-color: #28a745;
}

.form-group input:invalid:not(:focus):not(:placeholder-shown) {
  border-color: #dc3545;
}

/* Loading state animation */
.submit-button:disabled::after {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 8px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>