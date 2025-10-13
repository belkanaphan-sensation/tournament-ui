<template>
  <div id="app">
    <router-view />
    <ErrorModal ref="errorModal"/>
  </div>
</template>

<script>
  import ErrorModal from '@/components/ErrorModal.vue'

  export default {
    name: 'App',
    components: {
      ErrorModal
    },
    mounted() {
      // Регистрируем экземпляр модального окна
      this.$setErrorModal(this.$refs.errorModal)
    }
  }
</script>

<style>
  #app {
    font-family: Arial, sans-serif;
  }
</style>