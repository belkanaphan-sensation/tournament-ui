<template>
  <div class="home">
    <h1>Домашняя страница</h1>
    <p>Добро пожаловать на главную страницу!</p>
    <button @click="goToTest" class="nav-button">
      Перейти на страницу Test
    </button>
  </div>
</template>

<script>

export default {
  name: 'Home',
  methods: {
    goToTest() {
      this.$router.push('/test')
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

p {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 16px;
}

.nav-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #2980b9;
}
</style>