<template>
  <div class="test">
    <h1>Тестовая страница</h1>
    <p>Это страница для тестирования!</p>
    <button @click="goToHome" class="nav-button">
      Вернуться на главную
    </button>
  </div>
</template>

<script>
export default {
  name: 'Test',
  methods: {
    goToHome() {
      this.$router.push('/home')
    }
  }
}
</script>

<style scoped>
.test {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: #e74c3c;
  margin-bottom: 20px;
}

p {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 16px;
}

.nav-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #c0392b;
}
</style>