import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const navigationData = ref(null)
  const dataTimestamp = ref(null)

  function setNavigationData(data) {
    navigationData.value = data
    dataTimestamp.value = Date.now()
  }

  function getNavigationData() {
    const data = navigationData.value
    // Автоочистка после получения
    navigationData.value = null
    dataTimestamp.value = null
    return data
  }

  function hasData() {
    return navigationData.value !== null
  }

  return { 
    navigationData, 
    dataTimestamp,
    setNavigationData, 
    getNavigationData,
    hasData
  }
})