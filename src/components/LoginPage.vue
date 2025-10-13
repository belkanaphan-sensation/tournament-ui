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
      >
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" :disabled="loading">
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
.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  border: 1px solid #f44336;
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>